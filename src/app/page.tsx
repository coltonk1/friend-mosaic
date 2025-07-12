export default function HomePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="max-w-xl text-center space-y-6">
                <h1 className="text-4xl font-bold text-gray-900">
                    Welcome to Friend Mosaic
                </h1>
                <p className="text-gray-600 text-base">
                    A collaborative visual wall where you and your friends can
                    share memories, images, and videos.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a
                        href="/login"
                        className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                    >
                        Log In
                    </a>
                    <a
                        href="/signup"
                        className="px-5 py-2 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
                    >
                        Sign Up
                    </a>
                </div>
            </div>
        </main>
    );
}
