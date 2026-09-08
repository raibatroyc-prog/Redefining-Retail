import { authorizeOrganizationAccess, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";
import { isValidUuid } from "../validation";
import { buildInventoryRecommendations } from "../../intelligence/recommendation";
import { getProducts } from "../../services/inventory.service";
import { getSuppliers } from "../../services/supplier.service";
import type { IntelligenceProductLike, IntelligenceSupplierLike } from "../../intelligence/types";

export interface IntelligenceControllerDependencies {
  listProducts?: typeof getProducts;
  listSuppliers?: typeof getSuppliers;
  buildRecommendations?: typeof buildInventoryRecommendations;
}

function getRequestedOrganizationId(request: Request): string | null {
  const header = request.headers.get("x-org-id") ?? request.headers.get("x-organization-id");
  if (header) return header;

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

export function createIntelligenceController(deps: IntelligenceControllerDependencies = {}) {
  const listProductsFn = deps.listProducts ?? getProducts;
  const listSuppliersFn = deps.listSuppliers ?? getSuppliers;
  const buildRecommendationsFn = deps.buildRecommendations ?? buildInventoryRecommendations;

  return {
    async inventoryRecommendations(request: Request): Promise<Response> {
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

      const products = (await listProductsFn(resolvedOrgId)) as IntelligenceProductLike[];
      const suppliers = (await listSuppliersFn(resolvedOrgId)) as IntelligenceSupplierLike[];
      const recommendations = buildRecommendationsFn(products, suppliers);

      return new Response(
        JSON.stringify({
          data: recommendations,
          meta: {
            organizationId: resolvedOrgId,
            total: recommendations.length,
          },
        }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },
  };
}

export const intelligenceController = createIntelligenceController();
