import {
  authorizeOrganizationAccess,
  requireAuthentication,
} from "../auth";
import { ApiError } from "../request-context";
import { isValidUuid, parseBoolean, parseInteger } from "../validation";
import {
  getProduct,
  getProducts,
  getStockMovements,
} from "../../services/inventory.service";

export interface InventoryControllerDependencies {
  listProducts?: typeof getProducts;
  getProductById?: typeof getProduct;
  getMovements?: typeof getStockMovements;
}

function getRequestedOrganizationId(request: Request): string | null {
  const headers = [
    request.headers.get("x-org-id"),
    request.headers.get("x-organization-id"),
  ];

  const fromHeader = headers.find((value) => Boolean(value));
  if (fromHeader) {
    return fromHeader;
  }

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

function productStatus(product: { stock: number; capacity: number; demand_trend?: number | null }): "optimal" | "low" | "critical" | "overstock" {
  if (Number(product.capacity ?? 0) <= 0) {
    return "optimal";
  }

  const ratio = Number(product.stock ?? 0) / Number(product.capacity ?? 0);
  if (ratio < 0.1) return "critical";
  if (ratio < 0.3) return "low";
  if (ratio > 0.95 && Number(product.demand_trend ?? 0) < 0) return "overstock";
  return "optimal";
}

function isExpiring(product: { expires_at?: string | null }): boolean {
  if (!product.expires_at) return false;
  const expiry = new Date(product.expires_at).getTime();
  if (Number.isNaN(expiry)) return false;
  return expiry - Date.now() <= 72 * 60 * 60 * 1000;
}

function matchesSearch(product: { name?: string | null; sku?: string | null; brand?: string | null; department?: string | null }, rawSearch: string): boolean {
  const search = rawSearch.trim().toLowerCase();
  if (!search) return true;
  return [product.name, product.sku, product.brand, product.department]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search));
}

function toInventoryItem(product: Record<string, unknown>) {
  return {
    ...product,
    status: productStatus(product as {
      stock: number;
      capacity: number;
      demand_trend?: number | null;
    }),
    isExpiring: isExpiring(product as { expires_at?: string | null }),
  };
}

export function createInventoryController(deps: InventoryControllerDependencies = {}) {
  const listProductsFn = deps.listProducts ?? getProducts;
  const getProductByIdFn = deps.getProductById ?? getProduct;
  const getMovementsFn = deps.getMovements ?? getStockMovements;

  return {
    async list(request: Request): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const category = url.searchParams.get("category");
      const lowStock = parseBoolean(url.searchParams.get("lowStock"));
      const expiring = parseBoolean(url.searchParams.get("expiring"));
      const search = url.searchParams.get("search") ?? "";
      const limit = parseInteger(url.searchParams.get("limit"), 50, 200);
      const offset = parseInteger(url.searchParams.get("offset"), 0, 10_000);

      const products = await listProductsFn(resolvedOrgId);
      const filtered = products.filter((product) => {
        if (status && productStatus(product as any) !== status) return false;
        if (category && product.department !== category) return false;
        if (lowStock === true && productStatus(product as any) !== "low" && productStatus(product as any) !== "critical") return false;
        if (lowStock === false && productStatus(product as any) === "low" || productStatus(product as any) === "critical") return false;
        if (expiring === true && !isExpiring(product as any)) return false;
        if (expiring === false && isExpiring(product as any)) return false;
        if (!matchesSearch(product as any, search)) return false;
        return true;
      });

      const page = filtered.slice(offset, offset + limit);
      return new Response(
        JSON.stringify({
          data: page.map(toInventoryItem),
          meta: {
            organizationId: resolvedOrgId,
            total: filtered.length,
            limit,
            offset,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    },

    async getById(request: Request, productId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(productId)) {
        throw new ApiError("Product ID is not valid", 400, { code: "invalid_product_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      let product;
      try {
        product = await getProductByIdFn(productId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("single")) {
          throw new ApiError("Product not found", 404, { code: "not_found" });
        }
        throw error;
      }

      if (product.org_id !== resolvedOrgId) {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      }

      return new Response(
        JSON.stringify({
          data: toInventoryItem(product as Record<string, unknown>),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    },

    async movements(request: Request, productId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(productId)) {
        throw new ApiError("Product ID is not valid", 400, { code: "invalid_product_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      const product = await getProductByIdFn(productId);
      if (product.org_id !== resolvedOrgId) {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      }

      const limit = parseInteger(new URL(request.url).searchParams.get("limit"), 25, 200);
      const offset = parseInteger(new URL(request.url).searchParams.get("offset"), 0, 10_000);
      const movements = await getMovementsFn(resolvedOrgId, productId);
      const page = movements.slice(offset, offset + limit);

      return new Response(
        JSON.stringify({
          data: page,
          meta: {
            organizationId: resolvedOrgId,
            productId,
            total: movements.length,
            limit,
            offset,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    },
  };
}

export const inventoryController = createInventoryController();
