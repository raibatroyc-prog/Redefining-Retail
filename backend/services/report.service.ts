import { getSupabaseAdmin } from "./supabase.service";

export async function getInventorySummary(organizationId: string) {
  const supabase = getSupabaseAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock, capacity, demand_trend, expires_at")
    .eq("org_id", organizationId);

  if (error) {
    throw error;
  }

  const normalized = (products ?? []).map((product) => ({
    stock: Number(product.stock ?? 0),
    capacity: Number(product.capacity ?? 0),
    demandTrend: Number(product.demand_trend ?? 0),
    expiresAt: product.expires_at ?? null,
  }));

  const totalProducts = normalized.length;
  const totalStock = normalized.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = normalized.filter((product) => {
    if (product.capacity <= 0) return false;
    const ratio = product.stock / product.capacity;
    return ratio < 0.3;
  }).length;
  const overstockCount = normalized.filter((product) => {
    if (product.capacity <= 0) return false;
    const ratio = product.stock / product.capacity;
    return ratio > 0.95 && product.demandTrend < 0;
  }).length;
  const expiringSoonCount = normalized.filter((product) => {
    if (!product.expiresAt) return false;
    const expiry = new Date(product.expiresAt).getTime();
    if (Number.isNaN(expiry)) return false;
    return expiry - Date.now() <= 72 * 60 * 60 * 1000;
  }).length;

  const averageFillRate = totalProducts === 0
    ? 0
    : normalized.reduce((sum, product) => {
        if (product.capacity <= 0) return sum + 1;
        return sum + Math.min(1, product.stock / product.capacity);
      }, 0) / totalProducts;

  return {
    organizationId,
    totalProducts,
    totalStock,
    lowStockCount,
    overstockCount,
    expiringSoonCount,
    averageFillRate,
    generatedAt: new Date().toISOString(),
  };
}
