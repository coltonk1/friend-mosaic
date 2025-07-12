"use client";

import Mosaic from "./mosaic";
import ListView from "./listview";
import { RefObject } from "react";

type PositionedTile = {
    file_url: string;
    file_width: number;
    file_height: number;
    type: string;
    thumb_url: string;
    text_content: string;
    x: number;
    y: number;
    colSpan: number;
    rowSpan: number;
};

type Props = {
    loading: boolean;
    viewMode: "mosaic" | "list";
    toggleViewMode: () => void;
    handleExportImage: () => void;
    tiles: PositionedTile[];
    mosaicRef: RefObject<HTMLDivElement | null>;
};

export default function ViewerSection({
    loading,
    viewMode,
    toggleViewMode,
    handleExportImage,
    tiles,
    mosaicRef,
}: Props) {
    return (
        <div className="border-zinc-300 border-t border-b object-contain flex flex-col w-full">
            {loading ? (
                <div className="flex items-center justify-center py-10 space-x-2 text-sm text-gray-600 ">
                    <svg
                        className="w-5 h-5 animate-spin text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    <div
                        className="w-full bg-white border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-15 border-b z-10 mx-auto"
                        style={{
                            boxShadow: "0 0 10px 5px #0001",
                        }}
                    >
                        {/* Left: Download + Note */}
                        {viewMode === "mosaic" && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <button
                                    onClick={handleExportImage}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-5 py-2 rounded-lg transition"
                                >
                                    Download Mosaic
                                </button>

                                <div className="flex items-start space-x-2 bg-blue-50 text-blue-800 text-sm px-3 py-2 rounded-md border border-blue-200">
                                    <svg
                                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 16h-1v-4h-1m1-4h.01M12 18.5A6.5 6.5 0 1118.5 12 6.5 6.5 0 0112 18.5z"
                                        />
                                    </svg>
                                    <span>
                                        Zooming in more will result in higher
                                        quality downloads.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Right: View toggle */}
                        <div className="flex justify-end mr-0 ml-auto">
                            <button
                                onClick={toggleViewMode}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Switch to{" "}
                                {viewMode === "mosaic" ? "List" : "Mosaic"} View
                            </button>
                        </div>
                    </div>

                    {viewMode === "mosaic" ? (
                        <Mosaic tiles={tiles} refObject={mosaicRef} />
                    ) : (
                        <ListView tiles={tiles} />
                    )}
                </>
            )}
        </div>
    );
}
