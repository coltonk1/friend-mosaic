"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { joinWall } from "@/utils/walls/join";

export default function AutoJoinPage() {
    const router = useRouter();
    const params = useParams();
    const { wallId, code } = params as { wallId: string; code: string };

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function verifyAndJoin() {
            console.log(wallId, code);
            if (!wallId || !code) return;

            // const { data, error } = await supabase
            //     .from("walls")
            //     .select("code, link_code")
            //     .eq("id", wallId)
            //     .single();

            // if (error || !data) {
            //     setError("Invalid wall ID.");
            //     return;
            // }

            // if (data.code !== code && data.link_code !== code) {
            //     setError("Invalid join code.");
            //     return;
            // }

            const {
                data: { user },
            } = await supabase.auth.getUser();

            let result = false;
            if (user) {
                result = await joinWall(wallId, code);
            }

            console.log(result);
            if (!result) {
                console.warn("ERROR JOINING WALL");
                setError("Error joining wall. Check code or retry");
                return;
            }

            router.push(`/walls/${wallId}`);
        }
        console.log("YO");
        verifyAndJoin();
    }, [wallId, code, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            {error ? (
                <div className="text-red-600 text-center">
                    <p className="text-lg font-semibold mb-2">Join Failed</p>
                    <p>{error}</p>
                </div>
            ) : (
                <p className="text-gray-600 text-sm">Joining wall...</p>
            )}
        </div>
    );
}
