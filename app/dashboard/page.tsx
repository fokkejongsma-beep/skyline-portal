"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProjectRow = {
    id: string;
    name: string;
    payload: any;
    created_at: string;
};

export default function DashboardPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string>("user");
    const [projectName, setProjectName] = useState("");
    const [message, setMessage] = useState("");
    const [projects, setProjects] = useState<ProjectRow[]>([]);

    useEffect(() => {
        const loadUserAndProjects = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return;
            }

            const user = data.user;
            setEmail(user?.email ?? null);
            setUserId(user?.id ?? null);

            if (user?.id && user?.email) {
                await ensureProfile(user.id, user.email);
                await loadRole(user.id);
                await loadProjects(user.id);
            }
        };

        loadUserAndProjects();
    }, []);

    const ensureProfile = async (id: string, email: string) => {
        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase.from("profiles").insert({
                id,
                email,
                role: "user",
            });

            if (error) {
                console.error("Error creating profile:", error);
            }
        }
    };

    const loadRole = async (id: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error(error);
            return;
        }

        setRole(data?.role ?? "user");
    };

    const loadProjects = async (uid: string) => {
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setMessage("Error loading projects: " + error.message);
            return;
        }

        setProjects(data ?? []);
    };

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
            note: "First saved online test project",
        };

        const { error } = await supabase.from("projects").insert({
            user_id: userId,
            name: projectName,
            payload,
        });

        if (error) {
            console.error(error);
            setMessage("Error saving project: " + error.message);
            return;
        }

        setMessage("Project saved successfully.");
        setProjectName("");
        await loadProjects(userId);
    };

    return (
        <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
            <h1>Dashboard</h1>
            <p>{email ? `Logged in as: ${email}` : "Not logged in"}</p>
            <p>Role: {role}</p>

            {role === "admin" && (
                <p style={{ color: "darkgreen", fontWeight: 600 }}>
                    Admin access enabled
                </p>
            )}

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

            <div style={{ marginTop: 40 }}>
                <h2>My Projects</h2>

                {projects.length === 0 ? (
                    <p>No saved projects yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: 8,
                                    padding: 16,
                                }}
                            >
                                <strong>{project.name}</strong>
                                <div style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
                                    Created: {new Date(project.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}