import Link from "next/link";

export default function ForOrganizersPage() {
    return (
        <main className="min-h-screen px-6 py-20 flex items-center justify-center">
            <div className="w-full max-w-5xl space-y-12 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Mosaic for Organizers
                    </h1>
                    <p className="text-gray-600 text-base max-w-2xl mx-auto">
                        Hosting an event or leading a community? Mosaic helps
                        you collect and showcase shared moments from your
                        audience in a single, collaborative wall.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                    <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Custom Walls
                        </h2>
                        <p className="text-sm text-gray-600">
                            Create unique walls for each event, team, or
                            gathering. Each wall has its own layout and
                            shareable link.
                        </p>
                    </div>

                    <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Live Contributions
                        </h2>
                        <p className="text-sm text-gray-600">
                            Attendees can upload photos, videos, and notes
                            directly from their device. No account needed.
                        </p>
                    </div>

                    <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Download & Archive
                        </h2>
                        <p className="text-sm text-gray-600">
                            Download high-res mosaics or export all content for
                            sharing, archiving, or post-event recaps.
                        </p>
                    </div>
                </div>

                <div className="pt-6">
                    <Link
                        href="/signup"
                        className="inline-block px-6 py-3 bg-[#9170D8] text-white rounded-full text-sm font-medium hover:bg-[#111827] hover:text-white transition"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </main>
    );
}
