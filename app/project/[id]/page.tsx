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

type StructuredPayload = {
    project: {
        oppy: string;
        area: string;
        revision: string;
    };
    layout: {
        width: number;
        height: number;
        elements: any[];
    };
    lighting: {
        downlights: any[];
        track: any[];
        furtivo: any[];
    };
    pricing: {
        textile: string;
        currency: string;
    };
};

const DEFAULT_PAYLOAD_TEMPLATE: StructuredPayload = {
    project: {
        oppy: "012345",
        area: "A1",
        revision: "R00",
    },
    layout: {
        width: 5000,
        height: 3000,
        elements: [],
    },
    lighting: {
        downlights: [],
        track: [],
        furtivo: [],
    },
    pricing: {
        textile: "standard",
        currency: "USD",
    },
};

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [project, setProject] = useState<ProjectRow | null>(null);
    const [formData, setFormData] = useState<StructuredPayload>(DEFAULT_PAYLOAD_TEMPLATE);
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
            const payloadToUse: StructuredPayload = {
                project: {
                    oppy: data.payload?.project?.oppy ?? DEFAULT_PAYLOAD_TEMPLATE.project.oppy,
                    area: data.payload?.project?.area ?? DEFAULT_PAYLOAD_TEMPLATE.project.area,
                    revision:
                        data.payload?.project?.revision ??
                        DEFAULT_PAYLOAD_TEMPLATE.project.revision,
                },
                layout: {
                    width: data.payload?.layout?.width ?? DEFAULT_PAYLOAD_TEMPLATE.layout.width,
                    height: data.payload?.layout?.height ?? DEFAULT_PAYLOAD_TEMPLATE.layout.height,
                    elements:
                        data.payload?.layout?.elements ?? DEFAULT_PAYLOAD_TEMPLATE.layout.elements,
                },
                lighting: {
                    downlights:
                        data.payload?.lighting?.downlights ??
                        DEFAULT_PAYLOAD_TEMPLATE.lighting.downlights,
                    track:
                        data.payload?.lighting?.track ?? DEFAULT_PAYLOAD_TEMPLATE.lighting.track,
                    furtivo:
                        data.payload?.lighting?.furtivo ?? DEFAULT_PAYLOAD_TEMPLATE.lighting.furtivo,
                },
                pricing: {
                    textile:
                        data.payload?.pricing?.textile ?? DEFAULT_PAYLOAD_TEMPLATE.pricing.textile,
                    currency:
                        data.payload?.pricing?.currency ?? DEFAULT_PAYLOAD_TEMPLATE.pricing.currency,
                },
            };
            setFormData(payloadToUse);
            setMessage("");
        };

        if (id) {
            loadProject();
        }
    }, [id]);

    const savePayload = async () => {
        if (!project) return;

        const payloadToSave: StructuredPayload = {
            project: {
                oppy: formData.project.oppy,
                area: formData.project.area,
                revision: formData.project.revision,
            },
            layout: {
                width: Number(formData.layout.width),
                height: Number(formData.layout.height),
                elements: formData.layout.elements,
            },
            lighting: {
                downlights: formData.lighting.downlights,
                track: formData.lighting.track,
                furtivo: formData.lighting.furtivo,
            },
            pricing: {
                textile: formData.pricing.textile,
                currency: formData.pricing.currency,
            },
        };

        const { data, error } = await supabase
            .from("projects")
            .update({ payload: payloadToSave })
            .eq("id", project.id)
            .select("id, payload")
            .maybeSingle();

        if (error) {
            setMessage("Error saving: " + error.message);
            return;
        }

        if (!data) {
            setMessage("Save was not applied. Check Supabase update policies.");
            return;
        }

        setProject({ ...project, payload: data.payload });
        setMessage("Payload updated successfully.");
    };

    const resetToTemplate = () => {
        setFormData(DEFAULT_PAYLOAD_TEMPLATE);
        setMessage("Template loaded. Click Save Payload to store it.");
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
                <h2>Project Data</h2>

                <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
                    <label>
                        <div>OPPY</div>
                        <input
                            type="text"
                            value={formData.project.oppy}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    project: { ...formData.project, oppy: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Area</div>
                        <input
                            type="text"
                            value={formData.project.area}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    project: { ...formData.project, area: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Revision</div>
                        <input
                            type="text"
                            value={formData.project.revision}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    project: { ...formData.project, revision: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Width</div>
                        <input
                            type="number"
                            value={formData.layout.width}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        width: Number(e.target.value),
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Height</div>
                        <input
                            type="number"
                            value={formData.layout.height}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        height: Number(e.target.value),
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Textile</div>
                        <input
                            type="text"
                            value={formData.pricing.textile}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, textile: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>

                    <label>
                        <div>Currency</div>
                        <input
                            type="text"
                            value={formData.pricing.currency}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, currency: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        />
                    </label>
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                    <button onClick={savePayload} style={{ padding: "10px 16px" }}>
                        Save Payload
                    </button>
                    <button onClick={resetToTemplate} style={{ padding: "10px 16px" }}>
                        Reset to Template
                    </button>
                </div>

                <div style={{ marginTop: 24 }}>
                    <h3>Current JSON Preview</h3>
                    <pre
                        style={{
                            background: "#f5f5f5",
                            padding: 16,
                            borderRadius: 8,
                            overflowX: "auto",
                        }}
                    >
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>

                {message && <p style={{ marginTop: 12 }}>{message}</p>}
            </div>
        </main>
    );
}