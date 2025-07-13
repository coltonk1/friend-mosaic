import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-7xl font-extrabold text-[#62DEAC] mb-4 tracking-tight">
                404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#303030] mb-2">
                Page Not Found
            </h2>
            <p className="text-base text-gray-600 max-w-md mb-6">
                The page you&apos;re looking for doesn&apos;t exist or may have
                been moved. If you typed the URL manually, double-check the
                spelling.
            </p>
            <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-[#A76FE3] text-white text-sm font-medium rounded-3xl hover:bg-[#955fd1] transition"
            >
                Return Home
            </Link>
        </div>
    );
}
