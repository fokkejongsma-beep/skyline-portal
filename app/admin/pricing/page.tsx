"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricingReference, setPricingReference] = useState<any[]>([]);

  useEffect(() => {
    const loadProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      setProject(data);
      setLoading(false);
    };

    loadProject();
  }, [params.id]);

  useEffect(() => {
    const loadPricing = async () => {
      const { data } = await supabase
        .from("pricing_reference")
        .select("*");

      setPricingReference(data || []);
    };

    loadPricing();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  // Example usage of pricingReference in calculations:
  // const sortedPricing = [...pricingReference].sort((a, b) => a.min_sqft - b.min_sqft);
  // const applicablePricing = sortedPricing.filter(...);

  return (
    <div>
      <h1>{project.name}</h1>
      {/* Render project details and pricing based on pricingReference */}
    </div>
  );
}