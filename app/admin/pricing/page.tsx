"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPricingPage() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [pricingSets, setPricingSets] = useState<any[]>([]);
    const [pricingReference, setPricingReference] = useState<any[]>([]);
    const [jointPricing, setJointPricing] = useState<any[]>([]);
    const [elementPricing, setElementPricing] = useState<any[]>([]);

    const [editingRates, setEditingRates] = useState<Record<string, number>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [editingJointRates, setEditingJointRates] = useState<Record<string, number>>({});
    const [editingElementRates, setEditingElementRates] = useState<Record<string, number>>({});
    const updateJointRate = async (id: string) => {
        const newRate = editingJointRates[id];
        if (newRate === undefined) return;

        setSavingId(id);

        await supabase
            .from("joint_pricing")
            .update({ unit_price: newRate })
            .eq("id", id);

        setJointPricing((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, unit_price: newRate } : row
            )
        );

        setSavingId(null);
    };

    const updateElementRate = async (id: string) => {
        const newRate = editingElementRates[id];
        if (newRate === undefined) return;

        setSavingId(id);

        await supabase
            .from("element_pricing")
            .update({ unit_price: newRate })
            .eq("id", id);

        setElementPricing((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, unit_price: newRate } : row
            )
        );

        setSavingId(null);
    };

    useEffect(() => {
        const loadData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // check role
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== "admin") {
                setLoading(false);
                return;
            }

            setIsAdmin(true);

            // load pricing tables
            const { data: sets } = await supabase.from("pricing_sets").select("*");
            const { data: ref } = await supabase.from("pricing_reference").select("*");
            const { data: joints } = await supabase.from("joint_pricing").select("*");
            const { data: elements } = await supabase.from("element_pricing").select("*");

            setPricingSets(sets || []);
            setPricingReference(ref || []);
            setJointPricing(joints || []);
            setElementPricing(elements || []);

            setLoading(false);
        };

        loadData();
    }, []);

    const updateRate = async (id: string) => {
        const newRate = editingRates[id];
        if (newRate === undefined) return;

        setSavingId(id);

        await supabase
            .from("pricing_reference")
            .update({ selected_rate: newRate })
            .eq("id", id);

        setPricingReference((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, selected_rate: newRate } : row
            )
        );

        setSavingId(null);
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    if (!isAdmin)
        return (
            <div style={{ padding: 20, color: "red" }}>
                Access denied – admin only
            </div>
        );

    return (
        <div style={{ padding: 20 }}>
            <h1>Admin Pricing Management</h1>

            {/* Pricing Sets */}
            <section style={{ marginTop: 30 }}>
                <h2>Pricing Sets</h2>
                {pricingSets.map((row) => (
                    <div key={row.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                        {row.name} ({row.status})
                    </div>
                ))}
            </section>

            {/* Pricing Reference */}
            <section style={{ marginTop: 30 }}>
                <h2>Pricing Reference</h2>
                {pricingReference.map((row) => {
                    const currentValue =
                        editingRates[row.id] !== undefined
                            ? editingRates[row.id]
                            : row.selected_rate;

                    return (
                        <div
                            key={row.id}
                            style={{
                                padding: 8,
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                {row.system} / {row.mount} | {row.min_sqft}–{row.max_sqft} sqft
                            </div>

                            <input
                                type="number"
                                value={currentValue}
                                onChange={(e) =>
                                    setEditingRates((prev) => ({
                                        ...prev,
                                        [row.id]: Number(e.target.value),
                                    }))
                                }
                                style={{ width: 100 }}
                            />

                            <button
                                onClick={() => updateRate(row.id)}
                                disabled={savingId === row.id}
                            >
                                {savingId === row.id ? "Saving..." : "Save"}
                            </button>
                        </div>
                    );
                })}
            </section>

            {/* Joint Pricing */}
            <section style={{ marginTop: 30 }}>
                <h2>Joint Pricing</h2>
                {jointPricing.map((row) => {
                    const currentValue =
                        editingJointRates[row.id] !== undefined
                            ? editingJointRates[row.id]
                            : row.unit_price;

                    return (
                        <div
                            key={row.id}
                            style={{
                                padding: 8,
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                {row.joint_type} – {row.description}
                            </div>

                            <input
                                type="number"
                                step="0.01"
                                value={currentValue}
                                onChange={(e) =>
                                    setEditingJointRates((prev) => ({
                                        ...prev,
                                        [row.id]: Number(e.target.value),
                                    }))
                                }
                                style={{ width: 100 }}
                            />

                            <button
                                onClick={() => updateJointRate(row.id)}
                                disabled={savingId === row.id}
                            >
                                {savingId === row.id ? "Saving..." : "Save"}
                            </button>
                        </div>
                    );
                })}
            </section>

            {/* Element Pricing */}
            <section style={{ marginTop: 30 }}>
                <h2>Element Pricing</h2>
                {elementPricing.map((row) => {
                    const currentValue =
                        editingElementRates[row.id] !== undefined
                            ? editingElementRates[row.id]
                            : row.unit_price;

                    return (
                        <div
                            key={row.id}
                            style={{
                                padding: 8,
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                {row.element_type} ({row.price_basis})
                            </div>

                            <input
                                type="number"
                                step="0.01"
                                value={currentValue}
                                onChange={(e) =>
                                    setEditingElementRates((prev) => ({
                                        ...prev,
                                        [row.id]: Number(e.target.value),
                                    }))
                                }
                                style={{ width: 100 }}
                            />

                            <button
                                onClick={() => updateElementRate(row.id)}
                                disabled={savingId === row.id}
                            >
                                {savingId === row.id ? "Saving..." : "Save"}
                            </button>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}