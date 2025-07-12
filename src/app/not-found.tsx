export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Page Not Found
            </h2>
            <p className="text-gray-600 text-sm mb-6">
                Sorry, the page you’re looking for doesn’t exist or has been
                moved.
            </p>
            <a
                href="/"
                className="inline-block px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
                Go back home
            </a>
        </div>
    );
}
