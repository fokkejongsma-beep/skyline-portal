"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
        });

        if (error) {
            setMessage("Error: " + error.message);
        } else {
            setMessage("Check your email for login link 🚀");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>Login</h1>

            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: 10, width: 300 }}
            />

            <br />
            <br />

            <button onClick={handleLogin} style={{ padding: 10 }}>
                Login / Sign up
            </button>

            <p>{message}</p>
        </div>
    );
}