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
        units: "mm" | "inch" | "ft";
    };
    layout: {
        width: number;
        height: number;
        mountType: string;
        systemType: string;
        outputType: string;
        channelProfile: string;
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
        units: "mm",
    },
    layout: {
        width: 5000,
        height: 3000,
        mountType: "Surface",
        systemType: "SCT",
        outputType: "XHF",
        channelProfile: "Wide",
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

const PRICING_REFERENCE = [
    { system: "SCT", mount: "surface", min_sqft: 0, max_sqft: 200, selected_rate: 105.8 },
    { system: "SCT", mount: "surface", min_sqft: 200, max_sqft: 500, selected_rate: 70.3 },
    { system: "SCT", mount: "surface", min_sqft: 500, max_sqft: 1000, selected_rate: 111.0 },
    { system: "SCT", mount: "surface", min_sqft: 1000, max_sqft: 999999, selected_rate: 68.5 },
    { system: "SCT", mount: "suspended", min_sqft: 0, max_sqft: 200, selected_rate: 174.0 },
    { system: "SCT", mount: "suspended", min_sqft: 200, max_sqft: 500, selected_rate: 95.5 },
    { system: "SCT", mount: "suspended", min_sqft: 500, max_sqft: 1000, selected_rate: 85.0 },
    { system: "SCT", mount: "suspended", min_sqft: 1000, max_sqft: 999999, selected_rate: 62.8 },
    { system: "TNW", mount: "surface", min_sqft: 0, max_sqft: 200, selected_rate: 113.5 },
    { system: "TNW", mount: "surface", min_sqft: 200, max_sqft: 500, selected_rate: 76.0 },
    { system: "TNW", mount: "surface", min_sqft: 500, max_sqft: 1000, selected_rate: 149.8 },
    { system: "TNW", mount: "surface", min_sqft: 1000, max_sqft: 999999, selected_rate: 90.8 },
    { system: "TNW", mount: "suspended", min_sqft: 0, max_sqft: 200, selected_rate: 177.0 },
    { system: "TNW", mount: "suspended", min_sqft: 200, max_sqft: 500, selected_rate: 112.0 },
    { system: "TNW", mount: "suspended", min_sqft: 500, max_sqft: 1000, selected_rate: 124.5 },
    { system: "TNW", mount: "suspended", min_sqft: 1000, max_sqft: 999999, selected_rate: 83.0 },
] as const;

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
                    units:
                        data.payload?.project?.units ?? DEFAULT_PAYLOAD_TEMPLATE.project.units,
                },
                layout: {
                    width: data.payload?.layout?.width ?? DEFAULT_PAYLOAD_TEMPLATE.layout.width,
                    height: data.payload?.layout?.height ?? DEFAULT_PAYLOAD_TEMPLATE.layout.height,
                    mountType:
                        data.payload?.layout?.mountType ??
                        DEFAULT_PAYLOAD_TEMPLATE.layout.mountType,
                    systemType:
                        data.payload?.layout?.systemType ??
                        DEFAULT_PAYLOAD_TEMPLATE.layout.systemType,
                    outputType:
                        data.payload?.layout?.outputType ??
                        DEFAULT_PAYLOAD_TEMPLATE.layout.outputType,
                    channelProfile:
                        data.payload?.layout?.channelProfile ??
                        DEFAULT_PAYLOAD_TEMPLATE.layout.channelProfile,
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
                units: formData.project.units,
            },
            layout: {
                width: Number(formData.layout.width),
                height: Number(formData.layout.height),
                mountType: formData.layout.mountType,
                systemType: formData.layout.systemType,
                outputType: formData.layout.outputType,
                channelProfile: formData.layout.channelProfile,
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

    const width = Number(formData.layout.width) || 0;
    const height = Number(formData.layout.height) || 0;

    const areaSqft =
        formData.project.units === "mm"
            ? (width / 304.8) * (height / 304.8)
            : formData.project.units === "inch"
                ? (width / 12) * (height / 12)
                : width * height;

    const areaSqm = areaSqft / 10.7639;

    const textileLabel =
        formData.pricing.textile === "texture"
            ? "Texture"
            : formData.pricing.textile === "waffle"
                ? "Waffle"
                : "Standard";

    const textileMultiplier =
        formData.pricing.textile === "texture"
            ? 1.05
            : formData.pricing.textile === "waffle"
                ? 1.13
                : 1;

    const mountKey = formData.layout.mountType.toLowerCase();

    const matchedRate = PRICING_REFERENCE.find(
        (row) =>
            row.system === formData.layout.systemType &&
            row.mount === mountKey &&
            areaSqft >= row.min_sqft &&
            areaSqft < row.max_sqft,
    );

    const baseRate = matchedRate?.selected_rate ?? null;
    const illuminatedTotal = baseRate !== null ? areaSqft * baseRate * textileMultiplier : null;
    const pricingNote =
        formData.pricing.currency === "CAD"
            ? "CAD selected. Uploaded pricing reference is USD-based; conversion is not configured yet."
            : "";

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
                        <div>OPPY Number</div>
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
                        <div>Area designation</div>
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
                        <select
                            value={formData.project.revision}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    project: { ...formData.project, revision: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="R00">R00</option>
                            <option value="R01">R01</option>
                            <option value="R02">R02</option>
                            <option value="R03">R03</option>
                            <option value="R04">R04</option>
                            <option value="R05">R05</option>
                            <option value="R06">R06</option>
                            <option value="R07">R07</option>
                            <option value="R08">R08</option>
                            <option value="R09">R09</option>
                            <option value="R10">R10</option>
                        </select>
                    </label>

                    <label>
                        <div>Units</div>
                        <select
                            value={formData.project.units}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    project: {
                                        ...formData.project,
                                        units: e.target.value as "mm" | "inch" | "ft",
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="mm">mm</option>
                            <option value="inch">inch</option>
                            <option value="ft">ft</option>
                        </select>
                    </label>

                    <label>
                        <div>Outer Length (L)</div>
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
                        <div>Outer Width (W)</div>
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
                        <div>Mounting Type</div>
                        <select
                            value={formData.layout.mountType}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        mountType: e.target.value,
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="Surface">Surface</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </label>

                    <label>
                        <div>Lighting System - CCT</div>
                        <select
                            value={formData.layout.systemType}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        systemType: e.target.value,
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="SCT">SCT</option>
                            <option value="TNW">TNW</option>
                        </select>
                    </label>

                    <label>
                        <div>Lighting System - Output</div>
                        <select
                            value={formData.layout.outputType}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        outputType: e.target.value,
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="XHF">XHF</option>
                            <option value="HF">HF</option>
                            <option value="MHF">MHF</option>
                            <option value="MF">MF</option>
                            <option value="LMF">LMF</option>
                            <option value="LF">LF</option>
                            <option value="ECO">ECO</option>
                        </select>
                    </label>

                    <label>
                        <div>Perimeter Channel</div>
                        <select
                            value={formData.layout.channelProfile}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    layout: {
                                        ...formData.layout,
                                        channelProfile: e.target.value,
                                    },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="Wide">Wide</option>
                            <option value="Narrow">Narrow</option>
                            <option value="SkySpan">SkySpan</option>
                        </select>
                    </label>

                    <label>
                        <div>Textile</div>
                        <select
                            value={formData.pricing.textile}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, textile: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="standard">Standard</option>
                            <option value="texture">Texture</option>
                            <option value="waffle">Waffle</option>
                        </select>
                    </label>

                    <label>
                        <div>Currency</div>
                        <select
                            value={formData.pricing.currency}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, currency: e.target.value },
                                })
                            }
                            style={{ width: "100%", padding: 10 }}
                        >
                            <option value="USD">USD</option>
                            <option value="CAD">CAD</option>
                        </select>
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

                <div
                    style={{
                        marginTop: 24,
                        padding: 16,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        background: "#fafafa",
                        maxWidth: 520,
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>Pricing Preview</h3>
                    <div>Outer area: {areaSqm.toFixed(2)} m²</div>
                    <div>Outer area: {areaSqft.toFixed(2)} sqft</div>
                    <div>Textile: {textileLabel}</div>
                    <div>Lighting System - CCT: {formData.layout.systemType}</div>
                    <div>Lighting System - Output: {formData.layout.outputType}</div>
                    <div>Mounting Type: {formData.layout.mountType}</div>
                    {baseRate !== null ? (
                        <>
                            <div>
                                Base rate ({textileLabel}): {formData.pricing.currency} {baseRate.toFixed(2)} / sqft
                            </div>
                            <div>
                                Illuminated total: {formData.pricing.currency} {illuminatedTotal?.toFixed(2)}
                            </div>
                        </>
                    ) : (
                        <div>No pricing reference found.</div>
                    )}
                    {pricingNote && (
                        <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>{pricingNote}</div>
                    )}
                </div>


                {message && <p style={{ marginTop: 12 }}>{message}</p>}
            </div>
        </main>
    );
}