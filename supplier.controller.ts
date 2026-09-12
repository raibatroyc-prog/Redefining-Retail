import { authorizeOrganizationAccess, requireAuthentication, requireOrganizationRole } from "../auth";
import { ApiError } from "../request-context";
import { createSupplier, getSupplier, getSuppliers, updateSupplier } from "../../services/supplier.service";
import {
  isValidUuid,
  optionalNonNegativeNumber,
  optionalString,
  parseInteger,
  parseJsonBody,
  requireEnum,
  requireString,
  ValidationError,
} from "../validation";

export interface SupplierControllerDependencies {
  listSuppliers?: typeof getSuppliers;
  getSupplierById?: typeof getSupplier;
  createSupplierFn?: typeof createSupplier;
  updateSupplierFn?: typeof updateSupplier;
}

// Free-text status column (database/schema.sql: suppliers.status TEXT
// DEFAULT 'on-time'); constrained here to the vocabulary already used
// across the UI/reporting so values stay consistent.
const SUPPLIER_STATUS_VALUES = ["on-time", "delayed", "at-risk"] as const;

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

export function createSupplierController(deps: SupplierControllerDependencies = {}) {
  const listSuppliersFn = deps.listSuppliers ?? getSuppliers;
  const getSupplierByIdFn = deps.getSupplierById ?? getSupplier;
  const createSupplierFn = deps.createSupplierFn ?? createSupplier;
  const updateSupplierFn = deps.updateSupplierFn ?? updateSupplier;

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

    /**
     * Manager/Admin business-record management operation: onboard a new
     * supplier. Restricted to `owner`/`manager` roles.
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
        const name = requireString(body, "name", 200);
        const category = optionalString(body, "category", 100);
        const contactEmail = optionalString(body, "contactEmail", 200);

        const supplier = await createSupplierFn(resolvedOrgId, { name, category, contactEmail });

        return new Response(
          JSON.stringify({ data: supplier }),
          { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },

    /**
     * Manager/Admin business-record management operation: update an
     * existing supplier's details/status. Restricted to `owner`/`manager`.
     */
    async update(request: Request, supplierId: string): Promise<Response> {
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

      await requireOrganizationRole({
        userId: auth.userId,
        organizationId: resolvedOrgId,
        supabase: auth.supabase,
        allowedRoles: ["owner", "manager"],
      });

      const existing = await getSupplierByIdFn(supplierId);
      if (existing.org_id !== resolvedOrgId) {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      }

      try {
        const body = await parseJsonBody(request);
        const name = optionalString(body, "name", 200);
        const category = optionalString(body, "category", 100);
        const contactEmail = optionalString(body, "contactEmail", 200);
        const status = body.status !== undefined ? requireEnum(body, "status", SUPPLIER_STATUS_VALUES) : undefined;
        const nextDelivery = optionalString(body, "nextDelivery", 40);
        const onTimeRate = optionalNonNegativeNumber(body, "onTimeRate");

        if (
          name === undefined && category === undefined && contactEmail === undefined &&
          status === undefined && nextDelivery === undefined && onTimeRate === undefined
        ) {
          throw new ValidationError("At least one field must be provided to update.", "empty_update");
        }

        const supplier = await updateSupplierFn(supplierId, {
          name,
          category,
          contactEmail,
          status,
          nextDelivery,
          onTimeRate,
        });

        return new Response(
          JSON.stringify({ data: supplier }),
          { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}

export const supplierController = createSupplierController();
