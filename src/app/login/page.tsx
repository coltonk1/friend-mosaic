// app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) return setError(error.message);
        router.push("/dashboard");
    };

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded">
            <h1 className="text-xl font-semibold mb-4">Login</h1>
            <input
                className="w-full border px-3 py-2 mb-3 text-sm rounded"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="w-full border px-3 py-2 mb-3 text-sm rounded"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
                onClick={handleLogin}
                className="w-full bg-black text-white py-2 text-sm rounded hover:bg-zinc-800"
            >
                Log In
            </button>
        </div>
    );
}
