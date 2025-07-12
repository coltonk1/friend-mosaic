"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import binPack from "bin-pack";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useRef } from "react";
import html2canvas from "html2canvas";

export default function Wall() {
    const wallId = "49930abc-43cf-46a9-9ef9-28e8cf0d0086";
    const [tiles, setTiles] = useState<PositionedTile[]>([]);
    const [textContent, setTextContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userUid, setUserUid] = useState<string | null>(null);

    const [contentWidth, setContentWidth] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [minX, setMinX] = useState(0);
    const [minY, setMinY] = useState(0);

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

        const positioned = layoutTiles(sortedTiles);
        setTiles(positioned);

        const minX = Math.min(...positioned.map((t) => t.x - t.file_width / 2));
        const maxX = Math.max(...positioned.map((t) => t.x + t.file_width / 2));
        const minY = Math.min(
            ...positioned.map((t) => t.y - t.file_height / 2)
        );
        const maxY = Math.max(
            ...positioned.map((t) => t.y + t.file_height / 2)
        );

        setContentWidth(maxX - minX);
        setContentHeight(maxY - minY);
        console.log(maxX, minX);
        setMinX(minX);
        setMinY(minY);
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

    const maxEndWidth = 1024;

    const handleExportImage = async () => {
        if (!mosaicRef.current) return;
        const canvas = await html2canvas(mosaicRef.current, {
            backgroundColor: null, // or 'white'
            useCORS: true,
        });
        const dataUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "mosaic.png";
        link.click();
    };

    return (
        <div className="mx-auto p-4">
            <div className="bg-white border rounded-lg p-4 mb-8 shadow-sm">
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

            <div className="w-full h-200 overflow-hidden border-zinc-300 border-1 object-contain">
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
                            style={{
                                width: contentWidth,
                                height: contentHeight,
                            }}
                            ref={mosaicRef}
                        >
                            {tiles.map((tile, i) => {
                                const randomZ =
                                    1 + Math.floor(Math.random() * 4);

                                return (
                                    <img
                                        key={i}
                                        src={tile.file_url}
                                        className="absolute border-5 border-white"
                                        style={{
                                            width: tile.file_width,
                                            height: tile.file_height,
                                            left:
                                                tile.x -
                                                minX -
                                                tile.file_width / 2,
                                            top:
                                                tile.y -
                                                minY -
                                                tile.file_height / 2,
                                            // clipPath: clip,
                                            scale: 1,
                                            borderWidth: randomZ * 5,
                                            zIndex: randomZ,
                                            // transition: "clip-path 0.5s ease", // optional for animation
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
}

function generateRandomPolygon(numPoints = 6, radius = 40): string {
    const centerX = 50;
    const centerY = 50;

    const angles = Array.from(
        { length: numPoints },
        () => Math.random() * 2 * Math.PI
    );
    angles.sort();

    const points = angles.map((angle) => {
        const r = radius + Math.random() * 20;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x.toFixed(1)}% ${y.toFixed(1)}%`;
    });

    return `polygon(${points.join(", ")})`;
}

interface Tile {
    file_url: string;
    file_width: number;
    file_height: number;
}

interface PositionedTile extends Tile {
    x: number;
    y: number;
}

function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function layoutTiles(tiles: Tile[]): PositionedTile[] {
    const sizeVariants = [1.0, 2.0, 3.0];

    const newTiles = tiles.map((t, i) => {
        const scale =
            sizeVariants[Math.floor(Math.random() * sizeVariants.length)];
        return {
            width: t.file_width * scale,
            height: t.file_height * scale,
            item: t,
        };
    });

    // return masonryLayout(tiles);

    return layoutTilesRegular(shuffle(tiles));
}

function masonryLayout(
    tiles: Tile[],
    columnWidth = 250,
    numCols = 5
): PositionedTile[] {
    const columns: { height: number; items: PositionedTile[] }[] = Array(
        numCols
    )
        .fill(0)
        .map(() => ({ height: 0, items: [] }));

    const positioned: PositionedTile[] = [];

    for (const tile of tiles) {
        const aspectRatio = tile.file_width / tile.file_height;
        const height = columnWidth / aspectRatio;

        const shortestCol = columns.reduce(
            (min, col, i) => (col.height < columns[min].height ? i : min),
            0
        );

        const x = shortestCol * columnWidth;
        const y = columns[shortestCol].height;

        const positionedTile: PositionedTile = {
            ...tile,
            file_width: columnWidth,
            file_height: height,
            x,
            y,
        };

        columns[shortestCol].items.push(positionedTile);
        columns[shortestCol].height += height;
        positioned.push(positionedTile);
    }

    return positioned;
}

function layoutTilesRegular(tiles: Tile[]): PositionedTile[] {
    const maxExpansionAttempts = 30;
    const stepIncrement = 50;
    const angleStep = Math.PI / 300;
    const stepsPerCircle = 600;
    const maxTries = 8000;
    const jitter = 10;

    const validTiles = tiles.filter(
        (tile) =>
            typeof tile.file_width === "number" &&
            typeof tile.file_height === "number" &&
            tile.file_width > 0 &&
            tile.file_height > 0
    );

    if (validTiles.length === 0) return [];

    for (let attempt = 0; attempt < maxExpansionAttempts; attempt++) {
        const positioned: PositionedTile[] = [];

        positioned.push({ ...validTiles[0], x: 0, y: 0 });

        const baseStep = 50 + attempt * stepIncrement;
        let failed = false;

        for (let i = 1; i < validTiles.length; i++) {
            const tile = validTiles[i];
            let placed = false;

            for (let t = 0; t < maxTries; t++) {
                const radius = baseStep * Math.floor(t / stepsPerCircle);
                const angle = (t % stepsPerCircle) * angleStep;

                const baseX = Math.round(radius * Math.cos(angle));
                const baseY = Math.round(radius * Math.sin(angle));

                // Add slight jitter to create a more organic layout
                const x =
                    baseX + Math.floor(Math.random() * jitter * 2 - jitter);
                const y =
                    baseY + Math.floor(Math.random() * jitter * 2 - jitter);

                const halfWidth = tile.file_width / 2;
                const halfHeight = tile.file_height / 2;

                const bbox = {
                    left: x - halfWidth,
                    right: x + halfWidth,
                    top: y - halfHeight,
                    bottom: y + halfHeight,
                };

                const overlaps = positioned.some((p) => {
                    const pHalfW = p.file_width / 2;
                    const pHalfH = p.file_height / 2;

                    const pBox = {
                        left: p.x - pHalfW,
                        right: p.x + pHalfW,
                        top: p.y - pHalfH,
                        bottom: p.y + pHalfH,
                    };

                    return !(
                        bbox.right < pBox.left ||
                        bbox.left > pBox.right ||
                        bbox.bottom < pBox.top ||
                        bbox.top > pBox.bottom
                    );
                });

                if (!overlaps) {
                    positioned.push({ ...tile, x, y });
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                failed = true;
                console.warn(`Could not place tile ${i} at step ${baseStep}`);
                break;
            }
        }

        if (!failed) {
            return positioned;
        }
    }

    console.warn("Layout failed even with max expansion.");
    return [];
}

function layoutTilesSpiral(tiles: Tile[]): PositionedTile[] {
    const maxExpansionAttempts = 30;
    const stepIncrement = 50;

    const validTiles = tiles.filter(
        (tile) =>
            typeof tile.file_width === "number" &&
            typeof tile.file_height === "number" &&
            tile.file_width > 0 &&
            tile.file_height > 0
    );

    if (validTiles.length === 0) return [];

    for (let attempt = 0; attempt < maxExpansionAttempts; attempt++) {
        const positioned: PositionedTile[] = [];

        positioned.push({ ...validTiles[0], x: 0, y: 0 });

        const baseStep = 50 + attempt * stepIncrement;
        const angleStep = Math.PI / 300;
        const stepsPerCircle = 600;
        const maxTries = 8000;
        let failed = false;

        for (let i = 1; i < validTiles.length; i++) {
            const tile = validTiles[i];
            let placed = false;

            for (let t = 0; t < maxTries; t++) {
                const radius = baseStep * Math.floor(t / stepsPerCircle);
                const angle = (t % stepsPerCircle) * angleStep;
                const x = Math.round(radius * Math.cos(angle));
                const y = Math.round(radius * Math.sin(angle));

                const halfWidth = tile.file_width / 2;
                const halfHeight = tile.file_height / 2;

                const bbox = {
                    left: x - halfWidth,
                    right: x + halfWidth,
                    top: y - halfHeight,
                    bottom: y + halfHeight,
                };

                const overlaps = positioned.some((p) => {
                    const pHalfW = p.file_width / 2;
                    const pHalfH = p.file_height / 2;

                    const pBox = {
                        left: p.x - pHalfW,
                        right: p.x + pHalfW,
                        top: p.y - pHalfH,
                        bottom: p.y + pHalfH,
                    };

                    return !(
                        bbox.right < pBox.left ||
                        bbox.left > pBox.right ||
                        bbox.bottom < pBox.top ||
                        bbox.top > pBox.bottom
                    );
                });

                if (!overlaps) {
                    positioned.push({ ...tile, x, y });
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                failed = true;
                console.warn(`Could not place tile ${i} at step ${baseStep}`);
                break;
            }
        }

        if (!failed) {
            return positioned;
        }
    }

    console.warn("Layout failed even with max expansion.");
    return [];
}
