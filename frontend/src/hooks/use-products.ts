import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/inventory-data";

export function useProducts(organizationId: string | null) {
  return useQuery({
    queryKey: ["products", organizationId],
    enabled: Boolean(supabase && organizationId),
    queryFn: async (): Promise<Product[]> => {
      if (!supabase || !organizationId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("org_id", organizationId)
        .order("name");
      if (error) throw error;
      return (data ?? []).map((product) => ({
        ...product,
        stock: Number(product.stock),
        capacity: Number(product.capacity),
        demand_trend: Number(product.demand_trend ?? 0),
        unit_cost: Number(product.unit_cost ?? 0),
        velocity: product.velocity ?? "Medium",
      }));
    },
  });
}
