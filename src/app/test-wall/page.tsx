"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useRef } from "react";
import html2canvas from "html2canvas";

export default function Wall() {
    const wallId = "49930abc-43cf-46a9-9ef9-28e8cf0d0086";
    const [tiles, setTiles] = useState<PositionedTile[]>([]);
    const [textContent, setTextContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const [userUid, setUserUid] = useState<string | null>(null);

    const mosaicRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) return console.error(error);
            setUserUid(data.user?.id ?? null);
        })();
    }, []);

    useEffect(() => {
        fetchTiles();
    }, []);

    async function fetchTiles() {
        const { data, error } = await supabase
            .from("tiles")
            .select("file_url, file_width, file_height")
            .eq("wall_id", wallId)
            .eq("type", "image")
            .not("file_url", "is", null);

        if (error) return console.error(error);
        if (!data) return;

        const valid = data.filter(
            (t) => t.file_url && t.file_width && t.file_height
        );

        const sortedTiles = [...valid].sort(
            (a, b) =>
                b.file_width * b.file_height - a.file_width * a.file_height
        );

        const positioned = assignTileSpans(sortedTiles);
        setTiles(positioned);
    }

    const [files, setFiles] = useState<File[]>([]);

    async function handleUpload() {
        console.log(!textContent, files, files.length);
        if ((!textContent && (!files || files.length === 0)) || !userUid)
            return;

        setUploading(true);

        const max_width = 500;
        const inserts = [];

        for (const file of files) {
            let file_url = null;
            let is_video = false;
            let file_width = null;
            let file_height = null;
            let type: "text" | "image" | "video" = "text";

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

            const publicUrl = supabase.storage
                .from("wall-uploads")
                .getPublicUrl(filePath).data.publicUrl;
            file_url = publicUrl;

            is_video = file.type.startsWith("video");
            type = is_video ? "video" : "image";

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
            }

            inserts.push({
                wall_id: wallId,
                text_content: null,
                file_url,
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

    return (
        <div className="mx-auto">
            <div className="bg-white  rounded-lg p-4 mb-8 shadow-sm">
                <textarea
                    placeholder="Write a memory..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full border rounded p-2 text-sm resize-none mb-2"
                />
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                        const selected = e.target.files;
                        if (selected) setFiles([...selected]);
                    }}
                />
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-3 bg-black text-white text-sm px-4 py-2 rounded"
                >
                    {uploading ? "Uploading..." : "Add to Wall"}
                </button>

                <button
                    onClick={handleExportImage}
                    className="bg-black text-white"
                >
                    Download Mosaic
                </button>
            </div>

            <div className="border-zinc-300 border-t-1 border-b-1 object-contain mx-auto">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.1}
                    maxScale={5}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                    limitToBounds={false}
                    doubleClick={{ disabled: true }}
                    pinch={{ step: 0.1 }}
                >
                    <TransformComponent>
                        <div
                            className="grid gap-2 w-[100vw]"
                            ref={mosaicRef}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                gridAutoRows: "150px",
                            }}
                        >
                            {tiles.map((tile, i) => (
                                <div
                                    key={i}
                                    style={{
                                        gridColumn: `span ${tile.colSpan}`,
                                        gridRow: `span ${tile.rowSpan}`,
                                        overflow: "hidden",
                                        backgroundImage: `url(${tile.file_url})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    className="relative transition hover:scale-102"
                                />
                            ))}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
}

type Tile = {
    file_url: string;
    file_width: number;
    file_height: number;
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

    function canPlace(row: number, col: number, spanX: number, spanY: number) {
        if (col + spanX > numCols || row + spanY > maxRows) return false;
        for (let r = row; r < row + spanY; r++) {
            for (let c = col; c < col + spanX; c++) {
                if (grid[r][c]) return false;
            }
        }
        return true;
    }

    function occupy(row: number, col: number, spanX: number, spanY: number) {
        for (let r = row; r < row + spanY; r++) {
            for (let c = col; c < col + spanX; c++) {
                grid[r][c] = true;
            }
        }
    }
}
