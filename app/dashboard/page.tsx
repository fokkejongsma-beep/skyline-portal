"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return;
            }

            setEmail(data.user?.email ?? null);
            setUserId(data.user?.id ?? null);
        };

        loadUser();
    }, []);

    const saveProject = async () => {
        if (!userId) {
            setMessage("You are not logged in.");
            return;
        }

        if (!projectName.trim()) {
            setMessage("Please enter a project name.");
            return;
        }

        const payload = {
            oppy_number: "",
            area_designation: "",
            revision: "R00",
            note: "First saved online test project"
        };

        const { error } = await supabase.from("projects").insert({
            user_id: userId,
            name: projectName,
            payload
        });

        if (error) {
            console.error(error);
            setMessage("Error saving project: " + error.message);
            return;
        }

        setMessage("Project saved successfully.");
        setProjectName("");
    };

    return (
        <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
            <h1>Dashboard</h1>
            <p>{email ? `Logged in as: ${email}` : "Not logged in"}</p>

            <div style={{ marginTop: 30 }}>
                <h2>Save Project</h2>

                <input
                    type="text"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ padding: 10, width: 320 }}
                />

                <div style={{ marginTop: 16 }}>
                    <button onClick={saveProject} style={{ padding: "10px 16px" }}>
                        Save Project
                    </button>
                </div>

                <p style={{ marginTop: 16 }}>{message}</p>
            </div>
        </main>
    );
}