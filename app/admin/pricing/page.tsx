

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
                {pricingReference.map((row) => (
                    <div key={row.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                        {row.system} / {row.mount} | {row.min_sqft}–{row.max_sqft} sqft → ${row.selected_rate}
                    </div>
                ))}
            </section>

            {/* Joint Pricing */}
            <section style={{ marginTop: 30 }}>
                <h2>Joint Pricing</h2>
                {jointPricing.map((row) => (
                    <div key={row.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                        {row.joint_type} – {row.description} → ${row.unit_price}
                    </div>
                ))}
            </section>

            {/* Element Pricing */}
            <section style={{ marginTop: 30 }}>
                <h2>Element Pricing</h2>
                {elementPricing.map((row) => (
                    <div key={row.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                        {row.element_type} ({row.price_basis}) → ${row.unit_price}
                    </div>
                ))}
            </section>
        </div>
    );
}