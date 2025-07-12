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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4">
                <h1 className="text-lg font-semibold text-center">
                    Enter Join Code
                </h1>
                <input
                    type="text"
                    className="w-full border px-3 py-2 rounded text-sm"
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
                >
                    {loading ? "Joining..." : "Join Wall"}
                </button>
            </div>
        </div>
    );
}
