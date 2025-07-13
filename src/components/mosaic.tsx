import { RefObject, useRef, useState, useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

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

type MosaicProps = {
    tiles: PositionedTile[];
    refObject?: RefObject<HTMLDivElement | null>;
    numCols: number;
};

export default function Mosaic({ tiles, refObject, numCols = 6 }: MosaicProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = Boolean(document.fullscreenElement);
            setIsFullscreen(isNowFullscreen);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement && containerRef.current) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else if (document.fullscreenElement) {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="relative w-full h-full bg-white " ref={containerRef}>
            <button
                onClick={toggleFullscreen}
                className="absolute top-2 right-2 z-20 border-2  border-[#9170D8] bg-white hover:bg-[#111827] text-sm font-medium text-[#9170D8] hover:border-white/0 hover:text-white px-5 py-2 rounded-lg transition cursor-pointer"
            >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>

            <div className="cursor-grab flex-1 flex flex-col h-full">
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
                    <TransformComponent wrapperClass="!w-full flex-1 bg-[url('/grid.png')] bg-repeat bg-[length:40px_40px]">
                        <div
                            className="grid gap-2 w-full"
                            ref={refObject}
                            style={{
                                gridTemplateColumns: `repeat(${numCols}, minmax(150px, 1fr))`,
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
                                        ...(tile.type === "image"
                                            ? {
                                                  backgroundImage: `url(${tile.file_url})`,
                                                  backgroundSize: "cover",
                                                  backgroundPosition: "center",
                                              }
                                            : tile.type === "video" &&
                                              tile.thumb_url
                                            ? {
                                                  backgroundImage: `url(${tile.thumb_url})`,
                                                  backgroundSize: "cover",
                                                  backgroundPosition: "center",
                                              }
                                            : {}),
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    className="relative transition hover:scale-102 hover:[&>p]:opacity-100 rounded-sm overflow-hidden bg-[#fafafa]"
                                >
                                    {tile.type === "video" && (
                                        <video
                                            src={tile.file_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                            className="relative z-0"
                                        />
                                    )}
                                    {tile.text_content &&
                                        (tile.type === "video" ||
                                            tile.type === "image") && (
                                            <p
                                                className="absolute inset-1 z-10 p-2 opacity-0 transition"
                                                style={{
                                                    backgroundColor: "#fff9",
                                                }}
                                            >
                                                {tile.text_content}
                                            </p>
                                        )}
                                    {tile.text_content &&
                                        tile.type === "text" && (
                                            <div className="w-full h-full bg-[#fafafa] border-[#e4e4e7] border-2 p-2 ">
                                                <span
                                                    className="line-clamp-5"
                                                    style={{
                                                        fontSize:
                                                            16 * tile.rowSpan,
                                                    }}
                                                >
                                                    {tile.text_content}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
}
