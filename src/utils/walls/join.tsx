import { supabase } from "@/utils/supabase/client";

export async function joinWall(wallId: string, code: string): Promise<boolean> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Auth error:", userError?.message || "No user found");
        return false;
    }

    const { error } = await supabase.rpc("join_wall_with_code", {
        p_wall_id: wallId,
        p_user_id: user.id,
        p_code: code,
    });

    if (error) {
        console.error("Join failed:", error.message);
        return false;
    }

    return true;
}
