"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { joinWall } from "@/utils/walls/join";

type Wall = {
    id: string;
    title: string;
    description: string;
    created_at: string;
};

export default function Dashboard() {
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
            setWalls(data.map((item: any) => item.walls));
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
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
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
                                className="p-4 border border-gray-200 rounded-xl hover:shadow transition cursor-pointer bg-white"
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
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={createWall}
                            className="bg-blue-600 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Create Wall
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
