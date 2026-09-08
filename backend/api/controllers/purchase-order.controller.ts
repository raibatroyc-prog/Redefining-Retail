import { authorizeOrganizationAccess, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";
import { getPurchaseOrders } from "../../services/purchase-order.service";
import { isValidUuid, parseInteger } from "../validation";

export interface PurchaseOrderControllerDependencies {
  listPurchaseOrders?: typeof getPurchaseOrders;
}

function getRequestedOrganizationId(request: Request): string | null {
  const header = request.headers.get("x-org-id") ?? request.headers.get("x-organization-id");
  if (header) return header;

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

export function createPurchaseOrderController(deps: PurchaseOrderControllerDependencies = {}) {
  const listPurchaseOrdersFn = deps.listPurchaseOrders ?? getPurchaseOrders;

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
  };
}

export const purchaseOrderController = createPurchaseOrderController();
