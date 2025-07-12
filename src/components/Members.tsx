"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface WallMember {
    user_id: string;
    name: string;
}

interface MembersProps {
    wallId: string;
}

export default function Members({ wallId }: MembersProps) {
    const [members, setMembers] = useState<WallMember[]>([]);

    useEffect(() => {
        if (!wallId) return;

        async function fetchMembers() {
            const { data, error } = await supabase
                .from("wall_members")
                .select("user_id, name")
                .eq("wall_id", wallId);

            if (error) {
                console.error("Failed to fetch members:", error);
            } else if (data) {
                setMembers(data);
            }
        }

        fetchMembers();
    }, [wallId]);

    return (
        <div className="space-y-4 max-w-6xl w-full mx-auto py-15">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-1">
                Wall Members
            </h2>
            {members.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No members yet</p>
            ) : (
                <ul className="list-none space-y-1 text-sm text-gray-800">
                    {members.map((member) => (
                        <li
                            key={member.user_id}
                            className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded"
                        >
                            <div className="flex items-center space-x-2">
                                <span>{member.name || "Unnamed user"}</span>
                            </div>
                            {/* Future buttons/permissions can go here */}
                            <div className="text-xs text-gray-500">Member</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
