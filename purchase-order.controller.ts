import { authorizeOrganizationAccess, requireAuthentication, requireOrganizationRole } from "../auth";
import { ApiError } from "../request-context";
import { getSupplier } from "../../services/supplier.service";
import { getProduct } from "../../services/inventory.service";
import {
  addPurchaseOrderItem,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus,
} from "../../services/purchase-order.service";
import {
  isValidUuid,
  parseInteger,
  parseJsonBody,
  requireEnum,
  requirePositiveNumber,
  ValidationError,
} from "../validation";

export interface PurchaseOrderControllerDependencies {
  listPurchaseOrders?: typeof getPurchaseOrders;
  createPurchaseOrderFn?: typeof createPurchaseOrder;
  addPurchaseOrderItemFn?: typeof addPurchaseOrderItem;
  updatePurchaseOrderStatusFn?: typeof updatePurchaseOrderStatus;
  getSupplierById?: typeof getSupplier;
  getProductById?: typeof getProduct;
}

const PO_STATUS_VALUES = ["draft", "sent", "received", "cancelled"] as const;

// Business rule (state machine): which status transitions are legal for a
// purchase order. Prevents e.g. re-sending a cancelled order or receiving
// an order that was never sent.
const PO_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["sent", "cancelled"],
  sent: ["received", "cancelled"],
  received: [],
  cancelled: [],
};

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
  const header = request.headers.get("x-org-id") ?? request.headers.get("x-organization-id");
  if (header) return header;

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

export function createPurchaseOrderController(deps: PurchaseOrderControllerDependencies = {}) {
  const listPurchaseOrdersFn = deps.listPurchaseOrders ?? getPurchaseOrders;
  const createPurchaseOrderFn = deps.createPurchaseOrderFn ?? createPurchaseOrder;
  const addPurchaseOrderItemFn = deps.addPurchaseOrderItemFn ?? addPurchaseOrderItem;
  const updatePurchaseOrderStatusFn = deps.updatePurchaseOrderStatusFn ?? updatePurchaseOrderStatus;
  const getSupplierByIdFn = deps.getSupplierById ?? getSupplier;
  const getProductByIdFn = deps.getProductById ?? getProduct;

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

      const query = new URL(request.url).searchParams;
      const limit = parseInteger(query.get("limit"), 50, 200);
      const offset = parseInteger(query.get("offset"), 0, 10_000);
      const purchaseOrders = await listPurchaseOrdersFn(resolvedOrgId);
      const page = purchaseOrders.slice(offset, offset + limit);

      return new Response(
        JSON.stringify({
          data: page,
          meta: {
            organizationId: resolvedOrgId,
            total: purchaseOrders.length,
            limit,
            offset,
          },
        }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },

    async getById(request: Request, purchaseOrderId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(purchaseOrderId)) {
        throw new ApiError("Purchase order ID is not valid", 400, { code: "invalid_purchase_order_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      const purchaseOrders = await listPurchaseOrdersFn(resolvedOrgId);
      const purchaseOrder = purchaseOrders.find((item) => item.id === purchaseOrderId);
      if (!purchaseOrder) {
        throw new ApiError("Purchase order not found", 404, { code: "not_found" });
      }

      return new Response(
        JSON.stringify({ data: purchaseOrder }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },

    /**
     * Manager/Admin management operation: open a new draft purchase order
     * against a supplier. Restricted to `owner`/`manager`.
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

      try {
        const body = await parseJsonBody(request);
        const supplierIdRaw = body.supplierId;
        if (typeof supplierIdRaw !== "string" || !isValidUuid(supplierIdRaw)) {
          throw new ValidationError("\"supplierId\" must be a valid supplier ID.", "invalid_field");
        }

        const supplier = await getSupplierByIdFn(supplierIdRaw);
        if (supplier.org_id !== resolvedOrgId) {
          throw new ApiError("Forbidden", 403, { code: "forbidden" });
        }

        const purchaseOrder = await createPurchaseOrderFn(resolvedOrgId, supplierIdRaw, auth.userId);

        return new Response(
          JSON.stringify({ data: purchaseOrder }),
          { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },

    /**
     * Manager/Admin management operation: add a line item (product,
     * quantity, unit cost) to a draft purchase order.
     */
    async addItem(request: Request, purchaseOrderId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(purchaseOrderId)) {
        throw new ApiError("Purchase order ID is not valid", 400, { code: "invalid_purchase_order_id" });
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

      const purchaseOrders = await listPurchaseOrdersFn(resolvedOrgId);
      const purchaseOrder = purchaseOrders.find((item) => item.id === purchaseOrderId);
      if (!purchaseOrder) {
        throw new ApiError("Purchase order not found", 404, { code: "not_found" });
      }
      if (purchaseOrder.status !== "draft") {
        throw new ApiError("Items can only be added to a draft purchase order.", 409, { code: "invalid_status" });
      }

      try {
        const body = await parseJsonBody(request);
        const productIdRaw = body.productId;
        if (typeof productIdRaw !== "string" || !isValidUuid(productIdRaw)) {
          throw new ValidationError("\"productId\" must be a valid product ID.", "invalid_field");
        }
        const quantity = requirePositiveNumber(body, "quantity");
        const unitCost = requirePositiveNumber(body, "unitCost");

        const product = await getProductByIdFn(productIdRaw);
        if (product.org_id !== resolvedOrgId) {
          throw new ApiError("Forbidden", 403, { code: "forbidden" });
        }

        const item = await addPurchaseOrderItemFn(purchaseOrderId, productIdRaw, quantity, unitCost);

        return new Response(
          JSON.stringify({ data: item }),
          { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },

    /**
     * Manager/Admin management operation + business algorithm guard: move
     * a purchase order through its lifecycle (approve/send, mark
     * received, or cancel). Enforces the PO_STATUS_TRANSITIONS state
     * machine so a PO can't skip or reverse stages.
     */
    async updateStatus(request: Request, purchaseOrderId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(purchaseOrderId)) {
        throw new ApiError("Purchase order ID is not valid", 400, { code: "invalid_purchase_order_id" });
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

      const purchaseOrders = await listPurchaseOrdersFn(resolvedOrgId);
      const purchaseOrder = purchaseOrders.find((item) => item.id === purchaseOrderId);
      if (!purchaseOrder) {
        throw new ApiError("Purchase order not found", 404, { code: "not_found" });
      }

      try {
        const body = await parseJsonBody(request);
        const nextStatus = requireEnum(body, "status", PO_STATUS_VALUES);

        const allowedNext = PO_STATUS_TRANSITIONS[purchaseOrder.status] ?? [];
        if (!allowedNext.includes(nextStatus)) {
          throw new ValidationError(
            `Cannot move a purchase order from "${purchaseOrder.status}" to "${nextStatus}".`,
            "invalid_transition",
          );
        }

        const updated = await updatePurchaseOrderStatusFn(purchaseOrderId, nextStatus);

        return new Response(
          JSON.stringify({ data: updated }),
          { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}

export const purchaseOrderController = createPurchaseOrderController();
