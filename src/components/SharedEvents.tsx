"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/utils/useUser";
import { format } from "date-fns";

type Event = {
    id: string;
    name: string;
    description: string;
    starts_at: string;
    ends_at: string;
    created_by: string;
    created_at: string;
};

type Response = {
    event_id: string;
    user_id: string;
    response: "yes" | "no" | "maybe";
};

type SharedEventsProps = {
    wallId: string;
};

export default function SharedEvents({ wallId }: SharedEventsProps) {
    const { user } = useUser();

    const [events, setEvents] = useState<Event[]>([]);
    const [responses, setResponses] = useState<Response[]>([]);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        starts_at: "",
        ends_at: "",
    });

    useEffect(() => {
        if (!wallId) return;

        fetchEvents();
        fetchResponses();

        const eventsSub = supabase
            .channel("events")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "events",
                    filter: `wall_id=eq.${wallId}`,
                },
                fetchEvents
            )
            .subscribe();

        const responsesSub = supabase
            .channel("event_responses")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "event_responses" },
                fetchResponses
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsSub);
            supabase.removeChannel(responsesSub);
        };
    }, [wallId]);

    interface WallMember {
        user_id: string;
        name: string;
    }

    const [wallMembers, setWallMembers] = useState<WallMember[] | null>(null);

    useEffect(() => {
        if (!wallId) return;

        async function fetchMembers() {
            const { data, error } = await supabase
                .from("wall_members")
                .select("user_id, name")
                .eq("wall_id", wallId);

            console.log(wallId);

            if (error) {
                console.error("Error fetching members:", error);
            } else if (data) {
                setWallMembers(data);
            }
        }

        fetchMembers();

        const channel = supabase
            .channel("wall-members-updates")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "wall_members",
                    filter: `wall_id=eq.${wallId}`,
                },
                (payload) => {
                    const newMember = payload.new as WallMember;
                    setWallMembers((prev) => {
                        if (!prev) return [newMember];
                        const exists = prev.some(
                            (m) => m.user_id === newMember.user_id
                        );
                        return exists ? prev : [...prev, newMember];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [wallId]);

    async function fetchEvents() {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("wall_id", wallId)
            .order("starts_at", { ascending: true });

        if (!error && data) setEvents(data);
    }

    async function fetchResponses() {
        const { data, error } = await supabase
            .from("event_responses")
            .select("event_id,response,user_id");

        if (!error && data) setResponses(data);
    }

    const grouped = responses.reduce<
        Record<
            string,
            {
                yes: string[];
                no: string[];
                maybe: string[];
            }
        >
    >((acc, r) => {
        const member = wallMembers?.find((m) => m.user_id === r.user_id);
        const name = member?.name || "Unknown";

        if (!acc[r.event_id]) acc[r.event_id] = { yes: [], no: [], maybe: [] };
        acc[r.event_id][r.response].push(name);

        return acc;
    }, {});

    if (!user) return;

    const myResponses = responses.reduce<Record<string, string>>((acc, r) => {
        if (r.user_id === user.id) {
            acc[r.event_id] = r.response;
        }
        return acc;
    }, {});

    async function createEvent() {
        if (!user || !form.name.trim()) return;

        const { error } = await supabase.from("events").insert({
            wall_id: wallId,
            name: form.name,
            description: form.description,
            starts_at: form.starts_at,
            ends_at: form.ends_at,
            created_by: user.id,
        });

        if (!error) {
            setForm({
                name: "",
                description: "",
                starts_at: "",
                ends_at: "",
            });
            setCreating(false);
        }
    }

    async function respond(eventId: string, response: "yes" | "no" | "maybe") {
        if (user == null) return;
        if (!user.id) return;

        await supabase.from("event_responses").upsert(
            [
                {
                    event_id: eventId,
                    user_id: user.id,
                    response,
                },
            ],
            {
                onConflict: "event_id,user_id",
                ignoreDuplicates: false,
            }
        );
    }

    return (
        <div className="w-full max-h-[90vh] overflow-y-scroll">
            <div className="space-y-8 max-w-6xl w-full mx-auto my-20">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Shared Events
                    </h2>
                    <button
                        onClick={() => setCreating(!creating)}
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        {creating ? "Cancel" : "+ New Event"}
                    </button>
                </div>

                {creating && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Event name"
                            className="w-full border border-gray-300 px-3 py-2 text-sm rounded"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <textarea
                            placeholder="Event description"
                            className="w-full border border-gray-300 px-3 py-2 text-sm rounded"
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                        />
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="datetime-local"
                                className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded"
                                value={form.starts_at}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        starts_at: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="datetime-local"
                                className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded"
                                value={form.ends_at}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        ends_at: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <button
                            onClick={createEvent}
                            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Create Event
                        </button>
                    </div>
                )}

                <div className="grid-cols-2 grid gap-6">
                    {events.map((ev) => {
                        const isPast = new Date(ev.ends_at) < new Date();

                        return (
                            <div
                                key={ev.id}
                                className="border border-gray-200 rounded-lg p-5 bg-white space-y-2"
                            >
                                <div className="text-lg font-semibold text-gray-800">
                                    {ev.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {ev.description}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {format(new Date(ev.starts_at), "PPpp")} –{" "}
                                    {format(new Date(ev.ends_at), "PPpp")}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {["yes", "maybe", "no"].map((opt) => {
                                        const isSelected =
                                            myResponses[ev.id] === opt;
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() =>
                                                    !isPast &&
                                                    respond(
                                                        ev.id,
                                                        opt as
                                                            | "yes"
                                                            | "no"
                                                            | "maybe"
                                                    )
                                                }
                                                disabled={isPast}
                                                className={`
        px-4 py-1.5 text-sm font-medium rounded-md border transition-colors duration-150
        ${
            isSelected
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
        }
        ${isPast ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
                                            >
                                                {opt[0].toUpperCase() +
                                                    opt.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-3 text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium text-green-600">
                                            Yes:
                                        </span>{" "}
                                        {grouped[ev.id]?.yes?.length || 0}
                                        <span className="text-gray-500 ml-2 text-xs">
                                            (
                                            {grouped[ev.id]?.yes?.join(", ") ||
                                                "No one"}
                                            )
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-yellow-600">
                                            Maybe:
                                        </span>{" "}
                                        {grouped[ev.id]?.maybe?.length || 0}
                                        <span className="text-gray-500 ml-2 text-xs">
                                            (
                                            {grouped[ev.id]?.maybe?.join(
                                                ", "
                                            ) || "No one"}
                                            )
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-red-600">
                                            No:
                                        </span>{" "}
                                        {grouped[ev.id]?.no?.length || 0}
                                        <span className="text-gray-500 ml-2 text-xs">
                                            (
                                            {grouped[ev.id]?.no?.join(", ") ||
                                                "No one"}
                                            )
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
