import { RefObject } from "react";
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
};

export default function Mosaic({ tiles, refObject }: MosaicProps) {
    return (
        <>
            <div className="cursor-grab flex-1 flex flex-col">
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
                    <TransformComponent wrapperClass="!w-full flex-1">
                        <div
                            className="grid gap-2 w-full"
                            ref={refObject}
                            style={{
                                gridTemplateColumns:
                                    "repeat(6, minmax(150px, 1fr))",
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
                                            <div className="w-full h-full bg-[#fafafa] border-[#e4e4e7] border-2 p-2">
                                                {tile.text_content}
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </>
    );
}
