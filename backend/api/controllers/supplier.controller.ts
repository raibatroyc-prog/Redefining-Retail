import { authorizeOrganizationAccess, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";
import { getSupplier, getSuppliers } from "../../services/supplier.service";
import { isValidUuid, parseInteger } from "../validation";

export interface SupplierControllerDependencies {
  listSuppliers?: typeof getSuppliers;
  getSupplierById?: typeof getSupplier;
}

function getRequestedOrganizationId(request: Request): string | null {
  const header = request.headers.get("x-org-id") ?? request.headers.get("x-organization-id");
  if (header) return header;

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

export function createSupplierController(deps: SupplierControllerDependencies = {}) {
  const listSuppliersFn = deps.listSuppliers ?? getSuppliers;
  const getSupplierByIdFn = deps.getSupplierById ?? getSupplier;

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
      const search = query.get("search") ?? "";
      const suppliers = await listSuppliersFn(resolvedOrgId);
      const filtered = suppliers.filter((supplier) => {
        if (!search) return true;
        return [supplier.name, supplier.category, supplier.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));
      });
      const data = filtered.slice(offset, offset + limit);

      return new Response(
        JSON.stringify({
          data,
          meta: {
            organizationId: resolvedOrgId,
            total: filtered.length,
            limit,
            offset,
          },
        }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },

    async getById(request: Request, supplierId: string): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }
      if (!isValidUuid(supplierId)) {
        throw new ApiError("Supplier ID is not valid", 400, { code: "invalid_supplier_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      let supplier;
      try {
        supplier = await getSupplierByIdFn(supplierId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("single")) {
          throw new ApiError("Supplier not found", 404, { code: "not_found" });
        }
        throw error;
      }

      if (supplier.org_id !== resolvedOrgId) {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      }

      return new Response(
        JSON.stringify({ data: supplier }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },
  };
}

export const supplierController = createSupplierController();
