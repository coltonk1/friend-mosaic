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

type ListViewProps = {
    tiles: PositionedTile[];
};

export default function ListView({ tiles }: ListViewProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-6 py-15">
            {tiles.map((tile, i) => (
                <div
                    key={i}
                    className="rounded-md overflow-hidden border border-gray-200  bg-white"
                >
                    {tile.type === "image" ? (
                        <img
                            src={tile.file_url}
                            alt={`memory-${i}`}
                            className="w-full object-cover"
                        />
                    ) : (
                        tile.type === "video" && (
                            <video
                                src={tile.file_url}
                                controls
                                className="w-full object-cover"
                            />
                        )
                    )}
                    {tile.text_content &&
                        (tile.type === "video" || tile.type === "image") && (
                            <div className="p-4 border-t text-md text-gray-700">
                                {tile.text_content}
                            </div>
                        )}
                    {tile.type == "text" && tile.text_content && (
                        <div className="w-full h-full bg-zinc-50 border-zinc-200 border p-2">
                            {tile.text_content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
