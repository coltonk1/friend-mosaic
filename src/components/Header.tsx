"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Demo Wall", href: "/test-wall" },
    { name: "For Organizers", href: "/organizers" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });

        // Listen for future auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(!!session);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh(); // or router.push("/") if you want redirect
    };

    return (
        <header className="w-full bg-white shadow-sm z-40 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <a
                    href="/"
                    className="text-xl font-bold text-gray-800 tracking-tight"
                >
                    Friend Mosaic
                </a>

                <nav className="hidden md:flex space-x-6 items-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-blue-600 transition"
                        >
                            {link.name}
                        </a>
                    ))}

                    <div className="hidden md:flex">
                        {isLoggedIn ? (
                            <>
                                <a
                                    href="/dashboard"
                                    className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    Dashboard
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="ml-2 text-sm px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <a
                                href="/login"
                                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Log In
                            </a>
                        )}
                    </div>
                </nav>

                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="block text-sm text-gray-700 hover:text-blue-600 transition"
                        >
                            {link.name}
                        </a>
                    ))}

                    {isLoggedIn ? (
                        <>
                            <a
                                href="/dashboard"
                                className="block text-sm text-blue-600 hover:underline"
                            >
                                Dashboard
                            </a>
                            <button
                                onClick={handleLogout}
                                className="block text-sm text-red-600 hover:underline"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="block text-sm text-blue-600 hover:underline pt-2"
                        >
                            Log In
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
