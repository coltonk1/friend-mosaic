"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                router.push("/dashboard");
            }
        };
        getSession();
    }, []);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) return setError(error.message);
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Welcome Back!
                    </h1>
                    <p className="opacity-50 text-sm mt-0">
                        Log in to access your shared memories.
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="border-2 mt-12  border-[#9170D8] bg-[#9170D8] hover:bg-[#111827] text-sm font-medium text-white hover:border-white/0 px-5 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-[#ff5851] hover:underline transition hover:text-[#111827]"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
