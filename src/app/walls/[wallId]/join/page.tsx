"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function JoinWallPage() {
    const { wallId } = useParams();
    const router = useRouter();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!code) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("walls")
            .select("code")
            .eq("id", wallId)
            .single();

        if (error || !data) {
            setError("Wall not found");
            setLoading(false);
            return;
        }

        if (data.code !== code) {
            setError("Invalid join code");
            setLoading(false);
            return;
        }

        router.push(`/${wallId}/join/${code}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-lg space-y-4">
                <h1 className="text-lg font-semibold text-center">
                    Enter Join Code
                </h1>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition"
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="border-2  border-[#9170D8] bg-[#9170D8] hover:bg-[#111827] text-sm font-medium text-white hover:border-white/0 px-5 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {loading ? "Joining..." : "Join Wall"}
                </button>
            </div>
        </div>
    );
}
