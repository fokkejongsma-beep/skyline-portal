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
    joints: {
        corner_narrow: number;
        corner_wide: number;
        t_narrow: number;
        t_wide: number;
        x_narrow: number;
        x_wide: number;
    };
    lighting: {
        downlights: any[];
        track: {
            items: Array<{ id: string; type: "mains" | "48V"; lengthMm: number }>;
        };
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
    joints: {
        corner_narrow: 4,
        corner_wide: 0,
        t_narrow: 0,
        t_wide: 0,
        x_narrow: 0,
        x_wide: 0,
    },
    lighting: {
        downlights: [],
        track: {
            items: [],
        },
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
    const [pricingReference, setPricingReference] = useState<any[]>([]);
    const [jointPricing, setJointPricing] = useState<any[]>([]);
    const [elementPricing, setElementPricing] = useState<any[]>([]);
    const [selectedElementType, setSelectedElementType] = useState("downlights");
    const [selectedTrackType, setSelectedTrackType] = useState<"mains" | "48V">("mains");
    const [selectedTrackLengthMm, setSelectedTrackLengthMm] = useState(1500);
    useEffect(() => {
        const loadElementPricing = async () => {
            const { data, error } = await supabase
                .from("element_pricing")
                .select("element_type, description, price_basis, unit_price, min_length_mm, max_length_mm, increment_mm");

            if (error) {
                console.error("Error loading element pricing:", error);
                return;
            }

            setElementPricing(data || []);
        };

        loadElementPricing();
    }, []);
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
                joints: {
                    corner_narrow:
                        data.payload?.joints?.corner_narrow ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.corner_narrow,
                    corner_wide:
                        data.payload?.joints?.corner_wide ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.corner_wide,
                    t_narrow:
                        data.payload?.joints?.t_narrow ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.t_narrow,
                    t_wide:
                        data.payload?.joints?.t_wide ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.t_wide,
                    x_narrow:
                        data.payload?.joints?.x_narrow ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.x_narrow,
                    x_wide:
                        data.payload?.joints?.x_wide ??
                        DEFAULT_PAYLOAD_TEMPLATE.joints.x_wide,
                },
                lighting: {
                    downlights:
                        data.payload?.lighting?.downlights ??
                        DEFAULT_PAYLOAD_TEMPLATE.lighting.downlights,
                    track: {
                        items:
                            data.payload?.lighting?.track?.items ??
                            DEFAULT_PAYLOAD_TEMPLATE.lighting.track.items,
                    },
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

    useEffect(() => {
        const loadPricing = async () => {
            const { data, error } = await supabase
                .from("pricing_reference")
                .select("system, mount, min_sqft, max_sqft, selected_rate");

            if (error) {
                console.error("Error loading pricing reference:", error);
                return;
            }

            setPricingReference(data || []);
        };

        loadPricing();
    }, []);

    useEffect(() => {
        const loadJointPricing = async () => {
            const { data, error } = await supabase
                .from("joint_pricing")
                .select("joint_type, description, unit_price");

            if (error) {
                console.error("Error loading joint pricing:", error);
                return;
            }

            setJointPricing(data || []);
        };

        loadJointPricing();
    }, []);

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
            joints: {
                corner_narrow: Number(formData.joints.corner_narrow),
                corner_wide: Number(formData.joints.corner_wide),
                t_narrow: Number(formData.joints.t_narrow),
                t_wide: Number(formData.joints.t_wide),
                x_narrow: Number(formData.joints.x_narrow),
                x_wide: Number(formData.joints.x_wide),
            },
            lighting: {
                downlights: formData.lighting.downlights,
                track: {
                    items: formData.lighting.track.items,
                },
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

    const addSelectedElement = () => {
        const newItem = { id: crypto.randomUUID() };

        if (selectedElementType === "downlights") {
            setFormData({
                ...formData,
                lighting: {
                    ...formData.lighting,
                    downlights: [...formData.lighting.downlights, newItem],
                },
            });
            return;
        }

        if (selectedElementType === "track") {
            setFormData({
                ...formData,
                lighting: {
                    ...formData.lighting,
                    track: {
                        ...formData.lighting.track,
                        items: [
                            ...formData.lighting.track.items,
                            {
                                id: crypto.randomUUID(),
                                type: selectedTrackType,
                                lengthMm: selectedTrackLengthMm,
                            },
                        ],
                    },
                },
            });
            return;
        }

        if (selectedElementType === "furtivo") {
            setFormData({
                ...formData,
                lighting: {
                    ...formData.lighting,
                    furtivo: [...formData.lighting.furtivo, newItem],
                },
            });
        }
    };

    const clearElements = () => {
        setFormData({
            ...formData,
            lighting: {
                ...formData.lighting,
                downlights: [],
                track: {
                    items: [],
                },
                furtivo: [],
            },
        });
    };

    const updateTrackItemLength = (itemId: string, newLengthMm: number) => {
        setFormData({
            ...formData,
            lighting: {
                ...formData.lighting,
                track: {
                    ...formData.lighting.track,
                    items: formData.lighting.track.items.map((item) =>
                        item.id === itemId ? { ...item, lengthMm: newLengthMm } : item,
                    ),
                },
            },
        });
    };

    const removeTrackItem = (itemId: string) => {
        setFormData({
            ...formData,
            lighting: {
                ...formData.lighting,
                track: {
                    ...formData.lighting.track,
                    items: formData.lighting.track.items.filter((item) => item.id !== itemId),
                },
            },
        });
    };

    const updateTrackItemType = (itemId: string, newType: "mains" | "48V") => {
        setFormData({
            ...formData,
            lighting: {
                ...formData.lighting,
                track: {
                    ...formData.lighting.track,
                    items: formData.lighting.track.items.map((item) =>
                        item.id === itemId ? { ...item, type: newType } : item,
                    ),
                },
            },
        });
    };

    const removeLightingItem = (kind: "downlights" | "furtivo", itemId: string) => {
        setFormData({
            ...formData,
            lighting: {
                ...formData.lighting,
                [kind]: formData.lighting[kind].filter((item: any) => item.id !== itemId),
            },
        });
    };

    const width = Number(formData.layout.width) || 0;
    const height = Number(formData.layout.height) || 0;

    const TRACK_LENGTH_OPTIONS_MM = [500, 1000, 1500] as const;

    const formatLengthForSelectedUnit = (mmValue: number) => {
        if (formData.project.units === "mm") {
            return `${mmValue} mm`;
        }

        if (formData.project.units === "inch") {
            return `${(mmValue / 25.4).toFixed(2)} in`;
        }

        return `${(mmValue / 304.8).toFixed(2)} ft`;
    };

    const toMmFromSelectedUnit = (value: number) => {
        if (formData.project.units === "mm") {
            return value;
        }
        if (formData.project.units === "inch") {
            return value * 25.4;
        }
        return value * 304.8;
    };

    const formatDimensionForSelectedUnit = (mmValue: number) => {
        if (formData.project.units === "mm") {
            return `${mmValue.toFixed(0)} mm`;
        }
        if (formData.project.units === "inch") {
            return `${(mmValue / 25.4).toFixed(2)} in`;
        }
        return `${(mmValue / 304.8).toFixed(2)} ft`;
    };

    const outerLengthMm = toMmFromSelectedUnit(width);
    const outerWidthMm = toMmFromSelectedUnit(height);

    const perimeterChannelMm =
        formData.layout.channelProfile === "Narrow"
            ? 104
            : formData.layout.channelProfile === "Wide"
                ? 168
                : 10;

    const innerLengthMm = Math.max(outerLengthMm - 2 * perimeterChannelMm, 0);
    const innerWidthMm = Math.max(outerWidthMm - 2 * perimeterChannelMm, 0);

    const outerAreaSqft = (outerLengthMm / 304.8) * (outerWidthMm / 304.8);
    const innerOpeningSqft = (innerLengthMm / 304.8) * (innerWidthMm / 304.8);
    const opticalAreaSqft = innerOpeningSqft;
    const outerAreaSqm = outerAreaSqft / 10.7639;

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

    const matchedRate = pricingReference.find(
        (row) =>
            row.system === formData.layout.systemType &&
            row.mount === mountKey &&
            opticalAreaSqft >= row.min_sqft &&
            opticalAreaSqft < row.max_sqft,
    );

    const baseRate = matchedRate?.selected_rate ?? null;
    const standardIlluminatedTotal = baseRate !== null ? opticalAreaSqft * baseRate : null;
    const illuminatedTotal = standardIlluminatedTotal !== null ? standardIlluminatedTotal * textileMultiplier : null;
    const pricingNote =
        formData.pricing.currency === "CAD"
            ? "CAD selected. Uploaded pricing reference is USD-based; conversion is not configured yet."
            : "";

    const jointPriceMap = Object.fromEntries(
        jointPricing.map((row) => [row.joint_type, Number(row.unit_price) || 0]),
    ) as Record<string, number>;

    const jointCounts = [
        {
            key: "corner_narrow",
            label: "Corner Joint Narrow",
            count: Number(formData.joints.corner_narrow) || 0,
        },
        {
            key: "corner_wide",
            label: "Corner Joint Wide",
            count: Number(formData.joints.corner_wide) || 0,
        },
        {
            key: "t_narrow",
            label: "T Joint Narrow",
            count: Number(formData.joints.t_narrow) || 0,
        },
        {
            key: "t_wide",
            label: "T Joint Wide",
            count: Number(formData.joints.t_wide) || 0,
        },
        {
            key: "x_narrow",
            label: "X Joint Narrow",
            count: Number(formData.joints.x_narrow) || 0,
        },
        {
            key: "x_wide",
            label: "X Joint Wide",
            count: Number(formData.joints.x_wide) || 0,
        },
    ];

    const jointBreakdown = jointCounts
        .filter((item) => item.count > 0)
        .map((item) => {
            const unitPrice = jointPriceMap[item.key] || 0;
            return {
                ...item,
                unitPrice,
                total: item.count * unitPrice,
            };
        });

    const jointTotal = jointBreakdown.reduce((sum, item) => sum + item.total, 0);

    const elementPriceMap = Object.fromEntries(
        elementPricing.map((row) => [row.element_type, row]),
    ) as Record<string, any>;

    const trackItems = Array.isArray(formData.lighting.track.items)
        ? formData.lighting.track.items
        : [];

    const trackMainsItems = trackItems.filter((item) => item.type === "mains");
    const track48VItems = trackItems.filter((item) => item.type === "48V");

    const trackLengthMm = trackItems.reduce(
        (sum, item) => sum + (Number(item.lengthMm) || 0),
        0,
    );

    const trackMainsLengthMm = trackMainsItems.reduce(
        (sum, item) => sum + (Number(item.lengthMm) || 0),
        0,
    );

    const track48VLengthMm = track48VItems.reduce(
        (sum, item) => sum + (Number(item.lengthMm) || 0),
        0,
    );

    const elementCounts = [
        {
            key: "track_mains",
            label: "Track Mains",
            count: trackMainsItems.length,
            lengthMm: trackMainsLengthMm,
        },
        {
            key: "track_48v",
            label: "Track 48V",
            count: track48VItems.length,
            lengthMm: track48VLengthMm,
        },
        {
            key: "downlights",
            label: "Downlights",
            count: Array.isArray(formData.lighting.downlights)
                ? formData.lighting.downlights.length
                : 0,
            lengthMm: 0,
        },
        {
            key: "furtivo",
            label: "Furtivo",
            count: Array.isArray(formData.lighting.furtivo) ? formData.lighting.furtivo.length : 0,
            lengthMm: 0,
        },
    ];

    const elementBreakdown = elementCounts
        .filter((item) => item.count > 0)
        .map((item) => {
            const pricingRow = elementPriceMap[item.key];
            const unitPrice = pricingRow ? Number(pricingRow.unit_price) || 0 : 0;
            const priceBasis = pricingRow?.price_basis || "each";

            const total =
                priceBasis === "length_mm"
                    ? item.lengthMm * unitPrice
                    : item.count * unitPrice;

            return {
                ...item,
                unitPrice,
                priceBasis,
                total,
            };
        });

    const elementTotal = elementBreakdown.reduce((sum, item) => sum + item.total, 0);
    const grandTotal = (illuminatedTotal || 0) + jointTotal + elementTotal;

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
                <strong>Created:</strong> {new Date(project.created_at).toLocaleString()}
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

                <div style={{ marginTop: 24, maxWidth: 520 }}>
                    <h3>Prefab Joints</h3>
                    <div style={{ display: "grid", gap: 12 }}>
                        <label>
                            <div>Corner Joint Narrow</div>
                            <input
                                type="number"
                                value={formData.joints.corner_narrow}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            corner_narrow: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>

                        <label>
                            <div>Corner Joint Wide</div>
                            <input
                                type="number"
                                value={formData.joints.corner_wide}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            corner_wide: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>

                        <label>
                            <div>T Joint Narrow</div>
                            <input
                                type="number"
                                value={formData.joints.t_narrow}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            t_narrow: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>

                        <label>
                            <div>T Joint Wide</div>
                            <input
                                type="number"
                                value={formData.joints.t_wide}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            t_wide: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>

                        <label>
                            <div>X Joint Narrow</div>
                            <input
                                type="number"
                                value={formData.joints.x_narrow}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            x_narrow: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>

                        <label>
                            <div>X Joint Wide</div>
                            <input
                                type="number"
                                value={formData.joints.x_wide}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        joints: {
                                            ...formData.joints,
                                            x_wide: Number(e.target.value),
                                        },
                                    })
                                }
                                style={{ width: "100%", padding: 10 }}
                            />
                        </label>
                    </div>
                </div>

                <div style={{ marginTop: 24, maxWidth: 520 }}>
                    <h3>Elements</h3>
                    <div style={{ display: "grid", gap: 12 }}>
                        <label>
                            <div>Element type</div>
                            <select
                                value={selectedElementType}
                                onChange={(e) => setSelectedElementType(e.target.value)}
                                style={{ width: "100%", padding: 10 }}
                            >
                                <option value="downlights">Cooledge Downlight</option>
                                <option value="track">Track</option>
                                <option value="furtivo">Furtivo</option>
                            </select>
                        </label>
                        {selectedElementType === "track" && (
                            <>
                                <label>
                                    <div>Track type</div>
                                    <select
                                        value={selectedTrackType}
                                        onChange={(e) =>
                                            setSelectedTrackType(e.target.value as "mains" | "48V")
                                        }
                                        style={{ width: "100%", padding: 10 }}
                                    >
                                        <option value="mains">Mains</option>
                                        <option value="48V">48V</option>
                                    </select>
                                </label>

                                <label>
                                    <div>Track length</div>
                                    <select
                                        value={selectedTrackLengthMm}
                                        onChange={(e) => setSelectedTrackLengthMm(Number(e.target.value))}
                                        style={{ width: "100%", padding: 10 }}
                                    >
                                        {TRACK_LENGTH_OPTIONS_MM.map((lengthMm) => (
                                            <option key={lengthMm} value={lengthMm}>
                                                {formatLengthForSelectedUnit(lengthMm)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div style={{ fontSize: 13, color: "#666" }}>
                                    Track length options are fixed at 500 mm, 1000 mm, and 1500 mm.
                                </div>
                            </>
                        )}

                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={addSelectedElement} style={{ padding: "10px 16px" }}>
                                Add Element
                            </button>
                            <button onClick={clearElements} style={{ padding: "10px 16px" }}>
                                Clear Elements
                            </button>
                        </div>

                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: 12,
                                background: "#fafafa",
                            }}
                        >
                            <div>Downlights: {formData.lighting.downlights.length}</div>
                            <div>Track items: {formData.lighting.track.items.length}</div>
                            <div>Track Mains length: {formatLengthForSelectedUnit(trackMainsLengthMm)}</div>
                            <div>Track 48V length: {formatLengthForSelectedUnit(track48VLengthMm)}</div>
                            <div>
                                Track total length: {formatLengthForSelectedUnit(trackLengthMm)}
                            </div>
                            {formData.lighting.track.items.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Track items</div>
                                    <div style={{ display: "grid", gap: 8 }}>
                                        {formData.lighting.track.items.map((item, index) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: 6,
                                                    padding: 8,
                                                    background: "#fff",
                                                }}
                                            >
                                                <div style={{ marginBottom: 6 }}>
                                                    Track {index + 1}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <select
                                                        value={item.type}
                                                        onChange={(e) =>
                                                            updateTrackItemType(
                                                                item.id,
                                                                e.target.value as "mains" | "48V",
                                                            )
                                                        }
                                                        style={{ padding: 8 }}
                                                    >
                                                        <option value="mains">Mains</option>
                                                        <option value="48V">48V</option>
                                                    </select>
                                                    <select
                                                        value={item.lengthMm}
                                                        onChange={(e) =>
                                                            updateTrackItemLength(
                                                                item.id,
                                                                Number(e.target.value),
                                                            )
                                                        }
                                                        style={{ padding: 8 }}
                                                    >
                                                        {TRACK_LENGTH_OPTIONS_MM.map((lengthMm) => (
                                                            <option key={lengthMm} value={lengthMm}>
                                                                {formatLengthForSelectedUnit(lengthMm)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => removeTrackItem(item.id)}
                                                        style={{ padding: "8px 12px" }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>Furtivo: {formData.lighting.furtivo.length}</div>
                        </div>
                    </div>
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
                    <div>Outer area: {outerAreaSqft.toFixed(2)} sqft</div>
                    <div>
                        Inner opening
                        <br />L: {formatDimensionForSelectedUnit(innerLengthMm)}
                        <br />W: {formatDimensionForSelectedUnit(innerWidthMm)}
                    </div>
                    <div>Optical area: {opticalAreaSqft.toFixed(2)} sqft</div>
                    <div>Textile: {textileLabel}</div>
                    <div>Lighting System - CCT: {formData.layout.systemType}</div>
                    <div>Lighting System - Output: {formData.layout.outputType}</div>
                    <div>Mounting Type: {formData.layout.mountType}</div>
                    {baseRate !== null ? (
                        <>
                            <div>
                                Base rate (Standard): {formData.pricing.currency} {baseRate.toFixed(2)} / sqft
                            </div>
                            <div>
                                Standard illuminated total: {formData.pricing.currency} {standardIlluminatedTotal?.toFixed(2)}
                            </div>
                            <div>
                                Illuminated total: {formData.pricing.currency}{" "}
                                {illuminatedTotal?.toFixed(2)}
                            </div>
                            <div style={{ marginTop: 12, fontWeight: 600 }}>
                                Grand total / sqft (outer): {formData.pricing.currency} {outerAreaSqft > 0 ? (grandTotal / outerAreaSqft).toFixed(2) : "0.00"} / sqft
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
                                <h3 style={{ marginTop: 0 }}>Elements Summary</h3>
                                {formData.lighting.downlights.length > 0 ? (
                                    formData.lighting.downlights.map((item, index) => (
                                        <div
                                            key={item.id}
                                            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                                        >
                                            <span>- Cooledge Downlight {index + 1}</span>
                                            <button
                                                onClick={() => removeLightingItem("downlights", item.id)}
                                                style={{ padding: "4px 8px" }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div>- no downlights</div>
                                )}

                                <div style={{ marginTop: 12, fontWeight: 600 }}>Tracks</div>
                                {formData.lighting.track.items.length > 0 ? (
                                    formData.lighting.track.items.map((item, index) => (
                                        <div key={item.id} style={{ marginBottom: 6 }}>
                                            - {item.type === "48V" ? "Track 48V" : "Track Mains"} {index + 1}: {formatLengthForSelectedUnit(item.lengthMm)}
                                        </div>
                                    ))
                                ) : (
                                    <div>- no track</div>
                                )}

                                <div style={{ marginTop: 12, fontWeight: 600 }}>Furtivo</div>
                                {formData.lighting.furtivo.length > 0 ? (
                                    formData.lighting.furtivo.map((item, index) => (
                                        <div
                                            key={item.id}
                                            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                                        >
                                            <span>- Furtivo {index + 1}</span>
                                            <button
                                                onClick={() => removeLightingItem("furtivo", item.id)}
                                                style={{ padding: "4px 8px" }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div>- no furtivo</div>
                                )}
                            </div>

                            <div style={{ marginTop: 12, fontWeight: 600 }}>Joint Pricing</div>
                            {jointBreakdown.length > 0 ? (
                                <>
                                    {jointBreakdown.map((item) => (
                                        <div key={item.key}>
                                            {item.label}: {item.count} × {formData.pricing.currency}{" "}
                                            {item.unitPrice.toFixed(2)} = {formData.pricing.currency}{" "}
                                            {item.total.toFixed(2)}
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 6 }}>
                                        Joint total: {formData.pricing.currency}{" "}
                                        {jointTotal.toFixed(2)}
                                    </div>
                                </>
                            ) : (
                                <div>No prefab joints counted.</div>
                            )}

                            <div style={{ marginTop: 12, fontWeight: 600 }}>Element Pricing</div>
                            {elementBreakdown.length > 0 ? (
                                <>
                                    {elementBreakdown.map((item) => (
                                        <div key={item.key}>
                                            {item.priceBasis === "length_mm"
                                                ? `${item.label}: ${formatLengthForSelectedUnit(item.lengthMm)} × ${formData.pricing.currency} ${item.unitPrice.toFixed(4)} = ${formData.pricing.currency} ${item.total.toFixed(2)}`
                                                : `${item.label}: ${item.count} × ${formData.pricing.currency} ${item.unitPrice.toFixed(2)} = ${formData.pricing.currency} ${item.total.toFixed(2)}`}
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 6 }}>
                                        Element total: {formData.pricing.currency}{" "}
                                        {elementTotal.toFixed(2)}
                                    </div>
                                    <div style={{ marginTop: 6, fontWeight: 600 }}>
                                        Grand total: {formData.pricing.currency}{" "}
                                        {grandTotal.toFixed(2)}
                                    </div>
                                </>
                            ) : (
                                <div>No priced lighting elements counted.</div>
                            )}
                        </>
                    ) : (
                        <div>No pricing reference found.</div>
                    )}
                    {pricingNote && (
                        <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                            {pricingNote}
                        </div>
                    )}
                </div>

                {message && <p style={{ marginTop: 12 }}>{message}</p>}
            </div>
        </main>
    );
}