export default function ForOrganizersPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-16 flex items-center justify-center">
            <div className="max-w-3xl space-y-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                    Friend Mosaic for Organizers
                </h1>
                <p className="text-gray-600 text-base">
                    Looking to create a shared space for memories at your event,
                    organization, or community? Friend Mosaic gives you the
                    tools to build a visual wall of images, videos, and notes
                    contributed by your audience.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 text-left mt-8">
                    <div className="p-4 border border-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Custom Walls
                        </h2>
                        <p className="text-sm text-gray-600">
                            Create and manage multiple walls for different
                            events or groups. Each wall has a unique link and
                            layout.
                        </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Live Contributions
                        </h2>
                        <p className="text-sm text-gray-600">
                            Let attendees upload content in real time using
                            mobile or desktop devices. No account required.
                        </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Moderation Tools
                        </h2>
                        <p className="text-sm text-gray-600">
                            Stay in control with tools to approve, remove, or
                            reorder content before it goes live.
                        </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Download & Archive
                        </h2>
                        <p className="text-sm text-gray-600">
                            Download high-resolution mosaics or export all
                            content for post-event sharing or archiving.
                        </p>
                    </div>
                </div>

                <div className="pt-8">
                    <a
                        href="/signup"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </main>
    );
}
