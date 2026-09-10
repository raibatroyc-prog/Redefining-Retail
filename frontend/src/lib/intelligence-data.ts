import type { InventoryRecommendation } from "../../../backend/intelligence/types";

export interface InventorySummary {
  organizationId: string;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  overstockCount: number;
  expiringSoonCount: number;
  averageFillRate: number;
  generatedAt: string;
}

export interface ApiCollectionMeta {
  organizationId: string;
  total: number;
  limit?: number;
  offset?: number;
}

export interface InventoryApiItem {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  department: string | null;
  aisle: string | null;
  stock: number;
  capacity: number;
  velocity: "High" | "Medium" | "Low";
  demand_trend: number;
  expires_at: string | null;
  last_received: string | null;
  unit_cost: number;
  supplier_id: string | null;
  status?: string;
  isExpiring?: boolean;
}

export type InventoryRecommendationData = InventoryRecommendation;

export function inventorySummaryQueryKey(organizationId: string | null) {
  return ["inventory-summary", organizationId] as const;
}

export function inventoryRecommendationsQueryKey(organizationId: string | null) {
  return ["inventory-recommendations", organizationId] as const;
}

export function resolveProductNames(
  products: Array<Pick<InventoryApiItem, "id" | "name">>,
): Map<string, string> {
  return new Map(products.map((product) => [product.id, product.name]));
}

export function formatFillRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatFreshness(iso: string): string {
  const timestamp = new Date(iso);
  if (Number.isNaN(timestamp.getTime())) return "Generated time unavailable";
  return `Data generated ${timestamp.toLocaleString()}`;
}
