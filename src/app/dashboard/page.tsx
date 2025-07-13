"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/utils/requireAuth";

type Wall = {
    id: string;
    title: string;
    description: string;
    created_at: string;
};

export default function Dashboard() {
    useRequireAuth();
    const router = useRouter();
    const [walls, setWalls] = useState<Wall[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJoinedWalls();
    }, []);

    async function fetchJoinedWalls() {
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth error or no user");
            return;
        }

        const { data, error } = await supabase
            .from("wall_members")
            .select("walls(id, title, description, created_at)")
            .eq("user_id", user.id)
            .order("joined_at", { ascending: false });

        if (error) {
            console.error("Error fetching joined walls:", error);
        } else {
            setWalls(data.flatMap((item) => item.walls));
        }
        setLoading(false);
    }

    async function createWall() {
        if (!title.trim()) return;

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
            console.warn(authError);
            return;
        }

        if (!user) return;
        console.log(user.id);

        const { data, error } = await supabase
            .from("walls")
            .insert({
                title,
                description,
                code,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Failed to create wall:", error);
            return;
        }

        router.push(`/walls/${data.id}/join/${code}`);
    }

    return (
        <div className="max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
            <section>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                    Your Walls
                </h1>

                {loading ? (
                    <div className="text-gray-500">Loading walls...</div>
                ) : walls.length === 0 ? (
                    <div className="text-gray-500">
                        You haven’t joined any walls yet.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {walls.map((wall) => (
                            <li
                                key={wall.id}
                                className="p-4 border border-gray-200 rounded-xl hover:shadow transition cursor-pointer bg-white hover:border-[#ff5851]"
                                onClick={() => router.push(`/walls/${wall.id}`)}
                            >
                                <div className="text-lg font-semibold text-gray-800">
                                    {wall.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {wall.description}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Create a New Wall
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <input
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] min-h-[100px] transition"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={createWall}
                            className="border-2  border-[#9170D8] bg-[#9170D8] hover:bg-[#111827] text-sm font-medium text-white hover:border-white/0 px-5 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            Create Wall
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
