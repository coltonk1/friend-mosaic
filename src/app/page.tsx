import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen px-6">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col-reverse lg:flex-row items-center justify-center gap-16 max-w-7xl mx-auto py-16">
                <div className="max-w-xl space-y-6 text-center lg:text-left">
                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
                        Your{" "}
                        <span className="text-[#FF5851]">Shared Story</span>,
                        all on{" "}
                        <span className="border-b-2 border-[#9170D8]">
                            One Wall
                        </span>
                    </h1>
                    <p className="text-gray-600 text-base">
                        Upload your memories, events, and messages to a shared
                        wall with friends. A collaborative place to relive the
                        best moments.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link
                            href="/dashboard"
                            className="transition border-2 border-[#111827] text-white rounded-3xl px-8 py-2 bg-[#111827] hover:bg-[#343a46] shadow-sm hover:shadow-lg"
                        >
                            Create a Wall
                        </Link>
                        <Link
                            href="/walls/49930abc-43cf-46a9-9ef9-28e8cf0d0086"
                            className="transition border-2 border-[#111827] text-[#111827] rounded-3xl px-8 py-2 bg-white hover:bg-zinc-200"
                        >
                            Try the Demo Wall
                        </Link>
                    </div>
                </div>

                <div className="w-full max-w-md lg:max-w-xl">
                    <img
                        src="hero_pic.webp"
                        alt="Mosaic preview"
                        className="w-full h-full object-contain"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-50 bg-gray-50 ">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            Upload Together
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Friends can add photos, videos, and messages in one
                            shared space.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            Plan Events
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Schedule events, react, and stay connected. All from
                            your wall.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            Download the Story
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Export your mosaic as a high-quality image to keep
                            or share.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-[#111827] text-white py-16">
                <div className="max-w-4xl mx-auto text-center space-y-6 px-6">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Ready to capture your group's story?
                    </h2>
                    <p className="text-gray-300 text-base">
                        Mosaic brings all your shared moments into one
                        beautiful, interactive wall.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block bg-[#FF5851] hover:bg-[#e04d48] text-white px-8 py-3 rounded-3xl text-sm font-medium transition"
                    >
                        Get Started
                    </Link>
                </div>
            </section>
        </main>
    );
}
