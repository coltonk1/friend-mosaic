import { useParams } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code"; // You must install: npm i react-qr-code

export default function WallSidebar({
    wallInfo,
    changePageState,
}: {
    wallInfo: {
        title: string;
        description?: string;
        link_code: string;
        code: string;
        id: string;
    };
    changePageState: (state: string) => void;
}) {
    const [showShare, setShowShare] = useState(false);
    const params = useParams();
    const wallId = params.wallId as string;

    const shareUrl = `${window.location.origin}/walls/${wallInfo.id}/join/${
        wallInfo.link_code || ""
    }`;
    const demoWallId = "49930abc-43cf-46a9-9ef9-28e8cf0d0086";
    const isDemo = wallId === demoWallId;

    return (
        <div
            className=" z-5 bg-white border-r border-zinc-200 px-10 py-8 w-72 space-y-6"
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
                    className=" hover:bg-[#111827] text-sm font-medium border-2 border-[#ff5851] text-[#ff5851] hover:text-white hover:border-[#111827] px-5 py-2 rounded-lg transition cursor-pointer w-full"
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
                    onClick={() => changePageState("viewer")}
                    className={`hover:bg-[#111827] text-sm font-medium bg-[#ff5851] text-white px-5 py-2 rounded-3xl transition cursor-pointer w-full`}
                >
                    Memory Viewer
                </button>
                <button
                    disabled={isDemo}
                    onClick={() => changePageState("events")}
                    className={`hover:bg-[#111827] text-sm font-medium bg-[#ff5851] text-white px-5 py-2 rounded-3xl transition cursor-pointer w-full  ${
                        isDemo
                            ? "!bg-gray-100 !text-gray-400 !cursor-not-allowed"
                            : ""
                    }`}
                >
                    Shared Events
                </button>
                <button
                    disabled={isDemo}
                    onClick={() => changePageState("members")}
                    className={`hover:bg-[#111827] text-sm font-medium bg-[#ff5851] text-white px-5 py-2 rounded-3xl transition cursor-pointer w-full  ${
                        isDemo
                            ? "!bg-gray-100 !text-gray-400 !cursor-not-allowed"
                            : ""
                    }`}
                >
                    Members
                </button>
                {/* <button
                    disabled={isDemo}
                    onClick={() => changePageState("availability")}
                    className={`w-full text-sm py-2 rounded-md transition  ${
                        isDemo
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
                    }`}
                >
                    Availability
                </button> */}
            </div>
        </div>
    );
}
