"use client";

import { createClient } from "@supabase/supabase-js";

export default function HomePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let status = "Missing env vars";

  if (url && key) {
    const supabase = createClient(url, key);
    console.log("Supabase connected:", supabase);
    status = "Supabase env looks OK";
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Skyline Portal</h1>
      <p>{status}</p>
      <p>Open browser console to inspect the client.</p>
    </main>
  );
}