import { useState } from "react";
import QRCode from "react-qr-code"; // You must install: npm i react-qr-code

export default function WallSidebar({
    wallInfo,
}: {
    wallInfo: {
        title: string;
        description?: string;
        link_code: string;
        code: string;
        id: string;
    };
}) {
    const [showShare, setShowShare] = useState(false);

    const shareUrl = `${window.location.origin}/walls/${wallInfo.id}/join/${
        wallInfo.link_code || ""
    }`;
    const joinCode = wallInfo.code;

    return (
        <div
            className="fixed top-32.5 h-full z-5 bg-white border-r border-zinc-200 px-10 py-8 w-72 space-y-6"
            style={{
                boxShadow: "0 0 10px 5px #0001",
            }}
        >
            <div>
                <h1 className="text-lg font-semibold text-gray-800">
                    {wallInfo.title}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    {wallInfo.description}
                </p>
            </div>

            <div>
                <button
                    onClick={() => setShowShare((prev) => !prev)}
                    className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
                >
                    {showShare ? "Hide Share Options" : "Share"}
                </button>

                {showShare && (
                    <div className="mt-4 space-y-3 text-sm text-gray-700">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Share Link
                            </label>
                            <div className="bg-gray-100 rounded px-3 py-2 break-all">
                                {shareUrl}
                            </div>
                        </div>

                        {/* <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Join Code
                            </label>
                            <div className="bg-gray-100 rounded px-3 py-2">
                                {joinCode}
                            </div>
                        </div> */}

                        <div className="pt-2">
                            <QRCode value={shareUrl} size={100} />
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 space-y-3">
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 text-sm py-2 rounded-md cursor-not-allowed"
                >
                    Shared Events
                </button>
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 text-sm py-2 rounded-md cursor-not-allowed"
                >
                    Members
                </button>
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 text-sm py-2 rounded-md cursor-not-allowed"
                >
                    Availability
                </button>
            </div>
        </div>
    );
}
