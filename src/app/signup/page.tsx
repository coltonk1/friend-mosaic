"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                // user is logged in
                router.push("/dashboard");
            }
        };
        getSession();
    }, []);

    const handleSignup = async () => {
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        } else {
            router.push("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Create Your Account
                    </h1>
                    <p className="opacity-50 text-sm mt-0">
                        Sign up to start saving your memories.
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="border-2 mt-12 border-[#9170D8] bg-[#9170D8] hover:bg-[#111827] text-sm font-medium text-white hover:border-white/0 px-5 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-[#ff5851] hover:underline transition hover:text-[#111827]"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
