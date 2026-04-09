"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProjectRow = {
    id: string;
    user_id: string;
    name: string;
    payload: any;
    created_at: string;
};

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [project, setProject] = useState<ProjectRow | null>(null);
    const [payloadText, setPayloadText] = useState("");
    const [message, setMessage] = useState("Loading project...");

    useEffect(() => {
        const loadProject = async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                console.error(error);
                setMessage("Error loading project: " + error.message);
                return;
            }

            if (!data) {
                setMessage("Project not found.");
                return;
            }

            setProject(data);
            setPayloadText(JSON.stringify(data.payload, null, 2));
            setMessage("");
        };

        if (id) {
            loadProject();
        }
    }, [id]);

    const savePayload = async () => {
        if (!project) return;

        try {
            const parsed = JSON.parse(payloadText);

            const { error } = await supabase
                .from("projects")
                .update({ payload: parsed })
                .eq("id", project.id);

            if (error) {
                setMessage("Error saving: " + error.message);
                return;
            }

            setMessage("Payload updated successfully.");
        } catch (e) {
            setMessage("Invalid JSON format.");
        }
    };

    if (!project) {
        return (
            <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
                <h1>Project</h1>
                <p>{message}</p>
            </main>
        );
    }

    return (
        <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
            <h1>{project.name}</h1>

            <p>
                <strong>Project ID:</strong> {project.id}
            </p>

            <p>
                <strong>User ID:</strong> {project.user_id}
            </p>

            <p>
                <strong>Created:</strong>{" "}
                {new Date(project.created_at).toLocaleString()}
            </p>

            <div style={{ marginTop: 24 }}>
                <h2>Payload</h2>
                <textarea
                    value={payloadText}
                    onChange={(e) => setPayloadText(e.target.value)}
                    style={{
                        width: "100%",
                        minHeight: 200,
                        fontFamily: "monospace",
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                    }}
                />

                <div style={{ marginTop: 12 }}>
                    <button onClick={savePayload} style={{ padding: "10px 16px" }}>
                        Save Payload
                    </button>
                </div>

                {message && (
                    <p style={{ marginTop: 12 }}>{message}</p>
                )}
            </div>
        </main>
    );
}