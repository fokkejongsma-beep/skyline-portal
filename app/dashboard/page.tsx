"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            setEmail(data.user?.email ?? null);
        };

        loadUser();
    }, []);

    return (
        <main style={{ padding: 40 }}>
            <h1>Dashboard</h1>
            <p>{email ? `Logged in as: ${email}` : "Not logged in"}</p>
        </main>
    );
}