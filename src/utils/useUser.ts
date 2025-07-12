"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

type User = {
    id: string;
    email?: string;
    [key: string]: any;
};

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!mounted) return;

            if (error) {
                console.error("Failed to get user", error.message);
                setUser(null);
            } else {
                setUser(data.user ?? null);
            }
            setLoading(false);
        };

        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            getUser();
        });

        return () => {
            mounted = false;
            listener?.subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
