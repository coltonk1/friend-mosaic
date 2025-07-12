import { createClient } from "@/utils/supabase/server";
export default async function Instruments() {
    const supabase = await createClient();
    const { data: instruments } = await supabase.from("instruments").select();
    return (
        <>
            <div className="bg-white shadow-sm border border-zinc-200 rounded-sm p-4 max-w-[220px] w-full text-sm text-zinc-800 break-words">
                <p>Still thinking about that night. Pure magic.</p>
            </div>
            <pre>{JSON.stringify(instruments, null, 2)}</pre>
        </>
    );
}
