"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { useRequireAuth } from "@/utils/requireAuth";
import WallSidebar from "@/components/wallsidebar";
import { useParams, useRouter } from "next/navigation";
import { joinWall } from "@/utils/walls/join";
import ViewerSection from "@/components/TileViewer";
import SharedEvents from "@/components/SharedEvents";
import Members from "@/components/Members";

function getVideoFirstFrame(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const url = URL.createObjectURL(file);

        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        video.addEventListener("loadeddata", () => {
            video.currentTime = 0;
        });

        video.addEventListener("seeked", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg");
            URL.revokeObjectURL(url);
            resolve(dataURL);
        });

        video.onerror = reject;
    });
}

export default function Wall() {
    useEffect(() => {
        const originalMaxHeight = document.body.style.maxHeight;
        const originalOverflow = document.body.style.overflow;

        document.body.style.maxHeight = "100vh";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.maxHeight = originalMaxHeight;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useRequireAuth();

    const router = useRouter();
    const params = useParams();
    const wallId = params.wallId as string;

    useEffect(() => {
        if (!wallId) return;

        async function ensureName() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;
            if (!wallId) return;

            const { data: member } = await supabase
                .from("wall_members")
                .select("name")
                .eq("user_id", user.id)
                .eq("wall_id", wallId)
                .single();

            if (!member?.name) {
                const name = prompt("Enter your name to join this wall");
                if (name?.trim()) {
                    await supabase
                        .from("wall_members")
                        .update({ name: name.trim() })
                        .eq("user_id", user.id)
                        .eq("wall_id", wallId);
                }
            }
        }

        ensureName();
    }, [wallId]);

    const [tiles, setTiles] = useState<PositionedTile[]>([]);
    const [textContent, setTextContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const [userUid, setUserUid] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"mosaic" | "list">("mosaic");
    const [loading, setLoading] = useState(true);
    const [wallInfo, setWallInfo] = useState<Wall | null>(null);
    const mosaicRef = useRef<HTMLDivElement>(null);

    const [currentPageState, setCurrentPageState] = useState("viewer");

    type Wall = {
        title: string;
        description: string;
        code: string;
        link_code: string;
        id: string;
    };

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) return console.error(error);
            setUserUid(data.user?.id ?? null);
        })();
    }, []);

    useEffect(() => {
        if (!wallId) return;
        checkMembership();
        fetchTiles();
        fetchWallInfo();
    }, [wallId]);

    async function checkMembership() {
        if (!userUid) return;

        const { data: wall, error } = await supabase
            .from("walls")
            .select("id")
            .eq("id", wallId)
            .single();

        if (error || !wall) {
            console.error("Wall not found");
            router.push("/404");
            return;
        }

        const autoJoinWallId = "49930abc-43cf-46a9-9ef9-28e8cf0d0086";
        if (wallId === autoJoinWallId) {
            await joinWall(wallId, "123456");
            return;
        }

        const { data: existing, error: checkError } = await supabase
            .from("wall_members")
            .select("user_id")
            .eq("wall_id", wallId)
            .eq("user_id", userUid)
            .maybeSingle();

        if (checkError || !existing) {
            router.push(`/wall/${wallId}/join`);
        }
    }

    async function fetchWallInfo() {
        const { data, error } = await supabase
            .from("walls")
            .select("title, description, code, link_code, id")
            .eq("id", wallId)
            .single();

        if (error) {
            console.error("Error fetching wall info:", error.message);
        } else {
            setWallInfo(data);
        }
    }

    useEffect(() => {
        if (!wallId) return;

        checkMembership();
        fetchTiles();
        fetchWallInfo();

        const channel = supabase
            .channel("tiles-wall-sub")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "tiles",
                    filter: `wall_id=eq.${wallId}`,
                },
                (payload) => {
                    console.log("New tile inserted:", payload);
                    fetchTiles();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [wallId]);

    async function fetchTiles() {
        const { data, error } = await supabase
            .from("tiles")
            .select(
                "file_url, file_width, file_height, type, created_at, thumb_url, text_content"
            )
            .eq("wall_id", wallId)
            .order("created_at", { ascending: false });
        if (error) return console.error(error);
        if (!data) return;

        const positioned = assignTileSpans(data);
        setTiles(positioned);
        setLoading(false);
        console.log("Done loading");
    }

    const [files, setFiles] = useState<File[]>([]);

    async function handleUpload() {
        if ((!textContent && (!files || files.length === 0)) || !userUid)
            return;

        setUploading(true);
        const max_width = 500;
        const inserts = [];

        for (const file of files) {
            const is_video = file.type.startsWith("video");
            const type = is_video ? "video" : "image";
            const fileExt = file.name.split(".").pop();
            const uuid = uuidv4();
            const filePath = `${wallId}/${uuid}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from("wall-uploads")
                .upload(filePath, file);
            if (uploadError) {
                console.error(uploadError);
                continue;
            }

            const file_url = supabase.storage
                .from("wall-uploads")
                .getPublicUrl(filePath).data.publicUrl;

            let file_width = null;
            let file_height = null;
            let thumbnail_url = null;

            if (type === "image") {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        file_width = max_width;
                        file_height = Math.floor(
                            img.height * (max_width / img.width)
                        );
                        URL.revokeObjectURL(objectUrl);
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = objectUrl;
                });
            } else {
                const dataUrl = await getVideoFirstFrame(file);
                const thumbBlob = await (await fetch(dataUrl)).blob();
                const thumbPath = `${wallId}/${uuid}-thumb.jpg`;

                const { error: thumbError } = await supabase.storage
                    .from("wall-uploads")
                    .upload(thumbPath, thumbBlob);
                if (!thumbError) {
                    thumbnail_url = supabase.storage
                        .from("wall-uploads")
                        .getPublicUrl(thumbPath).data.publicUrl;
                }

                const video = document.createElement("video");
                const objectUrl = URL.createObjectURL(file);
                await new Promise<void>((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        file_width = max_width;
                        file_height = Math.floor(
                            video.videoHeight * (max_width / video.videoWidth)
                        );
                        URL.revokeObjectURL(objectUrl);
                        resolve();
                    };
                    video.onerror = reject;
                    video.src = objectUrl;
                });
            }

            inserts.push({
                wall_id: wallId,
                text_content: textContent,
                file_url,
                thumb_url: thumbnail_url,
                type,
                is_video,
                file_width,
                file_height,
                user_id: userUid,
            });
        }

        if (!files.length && textContent) {
            inserts.push({
                wall_id: wallId,
                text_content: textContent,
                file_url: null,
                thumb_url: null,
                type: "text",
                is_video: false,
                file_width: null,
                file_height: null,
                user_id: userUid,
            });
        }

        if (inserts.length > 0) {
            const { error } = await supabase.from("tiles").insert(inserts);
            if (error) console.error(error);
        }

        setTextContent("");
        setFiles([]);
        fetchTiles();
        setUploading(false);
    }
    const toggleViewMode = () => {
        setViewMode((prev) => (prev === "mosaic" ? "list" : "mosaic"));
    };
    const handleExportImage = async () => {
        if (!mosaicRef.current) return;
        const canvas = await html2canvas(mosaicRef.current, {
            backgroundColor: null,
            useCORS: true,
        });
        const dataUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "mosaic.png";
        link.click();
    };

    const [showForm, setShowForm] = useState(false);

    return (
        <div className="relative mx-auto flex-1 flex flex-col w-full">
            {/* Floating Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="fixed bottom-6 right-6 z-20 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    + Add Memory
                </button>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-4xl w-full space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Add a Memory
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Memory Textarea */}
                        <textarea
                            placeholder="Write a memory..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        />

                        {/* File Input */}
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => {
                                const selected = e.target.files;
                                if (selected) setFiles([...selected]);
                            }}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? "Uploading..." : "Add to Wall"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex">
                {wallInfo &&
                    wallInfo.title &&
                    wallInfo.link_code &&
                    wallInfo.code && (
                        <WallSidebar
                            wallInfo={{
                                title: wallInfo.title,
                                description: wallInfo?.description,
                                link_code: wallInfo.link_code,
                                code: wallInfo.code,
                                id: wallInfo.id,
                            }}
                            changePageState={(state: string) => {
                                setCurrentPageState(state);
                            }}
                        />
                    )}

                {currentPageState === "viewer" ? (
                    <ViewerSection
                        loading={loading}
                        viewMode={viewMode}
                        toggleViewMode={toggleViewMode}
                        handleExportImage={handleExportImage}
                        tiles={tiles}
                        mosaicRef={mosaicRef}
                    />
                ) : currentPageState === "events" ? (
                    wallInfo ? (
                        <SharedEvents wallId={wallInfo.id} />
                    ) : null
                ) : currentPageState === "members" ? (
                    wallInfo ? (
                        <Members wallId={wallInfo.id} />
                    ) : null
                ) : null}
            </div>
        </div>
    );

    type Tile = {
        file_url: string;
        file_width: number;
        file_height: number;
        type: string;
        thumb_url: string;
        text_content: string;
    };

    type PositionedTile = Tile & {
        x: number;
        y: number;
        colSpan: number;
        rowSpan: number;
    };

    function seededRandom(seed: number): number {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    }

    function shuffle<T>(array: T[], seed = 2): T[] {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(seed + i) * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function assignTileSpans(
        tiles: Tile[],
        numCols = 6,
        maxRows = 100
    ): PositionedTile[] {
        const grid: boolean[][] = Array.from({ length: maxRows }, () =>
            Array(numCols).fill(false)
        );

        const positioned: PositionedTile[] = [];

        const spanOptions: [number, number][] = [];
        for (let w = 1; w <= Math.min(3, numCols); w++) {
            for (let h = 1; h <= 3; h++) {
                spanOptions.push([w, h]);
            }
        }

        let seed = 0;

        for (const tile of tiles) {
            let placed = false;
            const randomizedSpans = shuffle(spanOptions, ++seed * 12345);

            for (let row = 0; row < maxRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    for (const [spanX, spanY] of randomizedSpans) {
                        if (col + spanX > numCols) continue;

                        if (canPlace(row, col, spanX, spanY)) {
                            occupy(row, col, spanX, spanY);
                            positioned.push({
                                ...tile,
                                x: col,
                                y: row,
                                colSpan: spanX,
                                rowSpan: spanY,
                                file_width: spanX,
                                file_height: spanY,
                            });
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
                if (placed) break;
            }

            if (!placed) {
                console.warn("Could not place tile", tile);
            }
        }

        return positioned;

        function canPlace(
            row: number,
            col: number,
            spanX: number,
            spanY: number
        ) {
            if (col + spanX > numCols || row + spanY > maxRows) return false;
            for (let r = row; r < row + spanY; r++) {
                for (let c = col; c < col + spanX; c++) {
                    if (grid[r][c]) return false;
                }
            }
            return true;
        }

        function occupy(
            row: number,
            col: number,
            spanX: number,
            spanY: number
        ) {
            for (let r = row; r < row + spanY; r++) {
                for (let c = col; c < col + spanX; c++) {
                    grid[r][c] = true;
                }
            }
        }
    }
}
