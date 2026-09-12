import {
  authorizeOrganizationAccess,
  requireAuthentication,
  requireOrganizationRole,
} from "../auth";
import { ApiError } from "../request-context";
import {
  isValidUuid,
  optionalNonNegativeNumber,
  optionalString,
  parseBoolean,
  parseInteger,
  parseJsonBody,
  requireEnum,
  requirePositiveNumber,
  requireString,
  ValidationError,
} from "../validation";
import {
  addStockMovement,
  createProduct,
  getProduct,
  getProducts,
  getStockMovements,
} from "../../services/inventory.service";

export interface InventoryControllerDependencies {
  listProducts?: typeof getProducts;
  getProductById?: typeof getProduct;
  getMovements?: typeof getStockMovements;
  createProductFn?: typeof createProduct;
  addStockMovementFn?: typeof addStockMovement;
}

const STOCK_MOVEMENT_TYPES = ["sale", "receipt", "waste", "adjustment"] as const;
const VELOCITY_VALUES = ["High", "Medium", "Low"] as const;

function toApiError(error: unknown): ApiError {
  if (error instanceof ValidationError) {
    return new ApiError(error.message, 400, { code: error.code });
  }
  if (error instanceof ApiError) {
    return error;
  }
  throw error;
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

export function matchesInventoryFilters(
  product: Record<string, unknown>,
  filters: {
    status?: string | null;
    category?: string | null;
    lowStock?: boolean;
    expiring?: boolean;
    search?: string;
  },
): boolean {
  const status = productStatus(product as {
    stock: number;
    capacity: number;
    demand_trend?: number | null;
  });

  if (filters.status && status !== filters.status) return false;
  if (filters.category && product.department !== filters.category) return false;
  if (filters.lowStock === true && status !== "low" && status !== "critical") return false;
  if (filters.lowStock === false && (status === "low" || status === "critical")) return false;
  if (filters.expiring === true && !isExpiring(product as { expires_at?: string | null })) return false;
  if (filters.expiring === false && isExpiring(product as { expires_at?: string | null })) return false;
  if (!matchesSearch(product as {
    name?: string | null;
    sku?: string | null;
    brand?: string | null;
    department?: string | null;
  }, filters.search ?? "")) return false;
  return true;
}

export function createInventoryController(deps: InventoryControllerDependencies = {}) {
  const listProductsFn = deps.listProducts ?? getProducts;
  const getProductByIdFn = deps.getProductById ?? getProduct;
  const getMovementsFn = deps.getMovements ?? getStockMovements;
  const createProductFn = deps.createProductFn ?? createProduct;
  const addStockMovementFn = deps.addStockMovementFn ?? addStockMovement;

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
      const filtered = products.filter((product) => matchesInventoryFilters(product, {
        status,
        category,
        lowStock: lowStock ?? undefined,
        expiring: expiring ?? undefined,
        search,
      }));

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

    /**
     * Manager/Admin business operation: create a new product/SKU in the
     * organization's catalog. Restricted to `owner`/`manager` roles.
     */
    async create(request: Request): Promise<Response> {
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

      await requireOrganizationRole({
        userId: auth.userId,
        organizationId: resolvedOrgId,
        supabase: auth.supabase,
        allowedRoles: ["owner", "manager"],
      });

      let body: Record<string, unknown>;
      try {
        body = await parseJsonBody(request);

        const sku = requireString(body, "sku", 64);
        const name = requireString(body, "name", 200);
        const brand = optionalString(body, "brand", 100);
        const department = optionalString(body, "department", 100);
        const aisle = optionalString(body, "aisle", 50);
        const stock = optionalNonNegativeNumber(body, "stock");
        const capacity = optionalNonNegativeNumber(body, "capacity");
        const velocity = body.velocity !== undefined ? requireEnum(body, "velocity", VELOCITY_VALUES) : undefined;
        const demandTrend = optionalNonNegativeNumber(body, "demandTrend");
        const expiresAt = optionalString(body, "expiresAt", 40);
        const unitCost = optionalNonNegativeNumber(body, "unitCost");
        const supplierId = optionalString(body, "supplierId", 64);
        if (supplierId && !isValidUuid(supplierId)) {
          throw new ValidationError("\"supplierId\" is not a valid ID.", "invalid_field");
        }

        const product = await createProductFn({
          organizationId: resolvedOrgId,
          sku,
          name,
          brand,
          department,
          aisle,
          stock,
          capacity,
          velocity,
          demandTrend,
          expiresAt,
          unitCost,
          supplierId,
        });

        return new Response(
          JSON.stringify({ data: product }),
          { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },

    /**
     * User-side business operation (Working System requirement): record a
     * stock transaction (receipt, sale, waste or manual adjustment) against
     * a product. This is the primary "transaction/status handling"
     * operation available to any authenticated org member (staff, manager
     * or owner), and is the write path behind `addStockMovement()` in
     * inventory.service.ts.
     */
    async recordMovement(request: Request, productId: string): Promise<Response> {
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

      // Any org member (owner/manager/staff) may record a stock movement.
      await requireOrganizationRole({
        userId: auth.userId,
        organizationId: resolvedOrgId,
        supabase: auth.supabase,
        allowedRoles: ["owner", "manager", "staff"],
      });

      const product = await getProductByIdFn(productId);
      if (product.org_id !== resolvedOrgId) {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      }

      try {
        const body = await parseJsonBody(request);
        const type = requireEnum(body, "type", STOCK_MOVEMENT_TYPES);
        const quantity = requirePositiveNumber(body, "quantity");
        const note = optionalString(body, "note", 500);

        // Business rule: outbound movements (sale/waste) cannot exceed
        // current stock on hand.
        if ((type === "sale" || type === "waste") && quantity > Number(product.stock ?? 0)) {
          throw new ValidationError(
            `Cannot record a "${type}" of ${quantity} units — only ${product.stock ?? 0} in stock.`,
            "insufficient_stock",
          );
        }

        const movement = await addStockMovementFn(
          resolvedOrgId,
          productId,
          type,
          quantity,
          auth.userId,
          note,
        );

        return new Response(
          JSON.stringify({ data: movement }),
          { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}

export const inventoryController = createInventoryController();
