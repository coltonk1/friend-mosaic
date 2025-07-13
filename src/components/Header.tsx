"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Demo Wall", href: "/walls/49930abc-43cf-46a9-9ef9-28e8cf0d0086" },
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
        router.refresh();
    };

    return (
        <header className="w-full bg-white shadow-sm z-40 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-800 tracking-tight"
                >
                    <img src="/logo_mosaic.webp" className="h-10 w-auto"></img>
                </Link>

                <nav className="hidden md:flex space-x-6 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm text-[#111827] text-medium hover:text-[#ff5851] transition"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="hidden md:flex items-center gap-5">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="transition text-white rounded-3xl text-medium px-4 text-sm h-fit py-1.5 bg-[#ff5851] hover:bg-[#111827]"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="transition text-[#ff5851] text-medium rounded-3xl px-4 text-sm h-fit border border-[#ff5851] py-1.5  hover:bg-red-500 hover:text-white cursor-pointer"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="transition text-white rounded-3xl px-4 text-sm py-1.5 h-fit bg-[#ff5851] hover:bg-[#111827]"
                            >
                                Log In
                            </Link>
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
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-sm text-gray-700 hover:text-blue-600 transition"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="block text-sm text-blue-600 hover:underline"
                            >
                                Dashboard
                            </Link>
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
