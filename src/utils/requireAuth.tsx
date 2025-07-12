import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export function useRequireAuth(redirectTo = "/login") {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.push(redirectTo);
            }
        };
        checkAuth();
    }, [router, redirectTo]);
}
