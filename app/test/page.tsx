"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function TestPage() {
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        console.log("SUPABASE URL:", url);
        console.log("SUPABASE KEY EXISTS:", !!key);

        if (!url || !key) {
            console.error("Missing Supabase env vars");
            return;
        }

        const supabase = createClient(url, key);
        console.log("Supabase connected:", supabase);
    }, []);

    return <div>Supabase test page 👀 (check console)</div>;
}