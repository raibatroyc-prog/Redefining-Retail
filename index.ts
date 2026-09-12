import { agentController } from "../controllers/agent.controller";
import { healthController } from "../controllers/health.controller";
import { intelligenceController } from "../controllers/intelligence.controller";
import { inventoryController } from "../controllers/inventory.controller";
import { meController } from "../controllers/me.controller";
import { organizationController } from "../controllers/organization.controller";
import { purchaseOrderController } from "../controllers/purchase-order.controller";
import { reportController } from "../controllers/report.controller";
import { supplierController } from "../controllers/supplier.controller";
import { ApiError } from "../request-context";

export interface ApiRouteDependencies {
  onUnauthorized?: (request: Request) => Promise<Response> | Response;
  onNotFound?: (request: Request) => Promise<Response> | Response;
  healthController?: () => Promise<Response> | Response;
  agentController?: (request: Request) => Promise<Response> | Response;
  meController?: (request: Request) => Promise<Response> | Response;
  organizationController?: (request: Request) => Promise<Response> | Response;
  inventoryController?: {
    list?: (request: Request) => Promise<Response> | Response;
    getById?: (request: Request, productId: string) => Promise<Response> | Response;
    movements?: (request: Request, productId: string) => Promise<Response> | Response;
    create?: (request: Request) => Promise<Response> | Response;
    recordMovement?: (request: Request, productId: string) => Promise<Response> | Response;
  };
  supplierController?: {
    list?: (request: Request) => Promise<Response> | Response;
    getById?: (request: Request, supplierId: string) => Promise<Response> | Response;
    create?: (request: Request) => Promise<Response> | Response;
    update?: (request: Request, supplierId: string) => Promise<Response> | Response;
  };
  purchaseOrderController?: {
    list?: (request: Request) => Promise<Response> | Response;
    getById?: (request: Request, purchaseOrderId: string) => Promise<Response> | Response;
    create?: (request: Request) => Promise<Response> | Response;
    addItem?: (request: Request, purchaseOrderId: string) => Promise<Response> | Response;
    updateStatus?: (request: Request, purchaseOrderId: string) => Promise<Response> | Response;
  };
  reportController?: {
    inventorySummary?: (request: Request) => Promise<Response> | Response;
  };
  intelligenceController?: {
    inventoryRecommendations?: (request: Request) => Promise<Response> | Response;
  };
  requireAuthentication?: (request: Request) => Promise<unknown>;
  getOrganizationMemberships?: (userId: string, supabase: unknown) => Promise<Array<{ org_id: string; role: string }>>;
  authorizeOrganizationAccess?: (input: {
    request: Request;
    userId: string;
    supabase: unknown;
    organizationId?: string | null;
  }) => Promise<string>;
}

function jsonErrorResponse(code: string, message: string, status: number): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
      },
    }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}

function getRouteSegments(pathname: string): string[] {
  return pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
}

const POLISHED_FRONTEND_ORIGIN =
  process.env.POLISHED_FRONTEND_ORIGIN?.trim() || "https://smart-stock-savvy-47.lovable.app";

function withAgentCors(request: Request, response: Response): Response {
  const origin = request.headers.get("origin");
  if (origin !== POLISHED_FRONTEND_ORIGIN) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", POLISHED_FRONTEND_ORIGIN);
  headers.set("access-control-allow-headers", "Authorization, Content-Type, x-org-id");
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("vary", "Origin");
  return new Response(response.body, { status: response.status, headers });
}

export async function handleApiRequest(
  request: Request,
  dependencies: ApiRouteDependencies = {},
): Promise<Response> {
  const url = new URL(request.url);
  const segments = getRouteSegments(url.pathname);

  try {
    if (url.pathname === "/api/health") {
      return await (dependencies.healthController ?? healthController)();
    }

    if (url.pathname === "/api/agent/query") {
      if (request.method === "OPTIONS") {
        return withAgentCors(request, new Response(null, { status: 204 }));
      }
      return withAgentCors(request, await (dependencies.agentController ?? agentController)(request));
    }

    if (url.pathname === "/api/me") {
      return await (dependencies.meController ?? meController)(request);
    }

    if (segments[0] === "api" && segments[1] === "organizations" && segments[2]) {
      return await (dependencies.organizationController ?? organizationController)(request);
    }

    if (segments[0] === "api" && segments[1] === "inventory") {
      const inventory = dependencies.inventoryController ?? inventoryController;
      if (segments.length === 2) {
        if (request.method === "POST") {
          return await (inventory.create ?? inventoryController.create)(request);
        }
        return await (inventory.list ?? inventoryController.list)(request);
      }
      if (segments.length >= 3 && segments[2] && segments[3] === "movements") {
        if (request.method === "POST") {
          return await (inventory.recordMovement ?? inventoryController.recordMovement)(request, segments[2]);
        }
        return await (inventory.movements ?? inventoryController.movements)(request, segments[2]);
      }
      if (segments.length >= 3 && segments[2]) {
        return await (inventory.getById ?? inventoryController.getById)(request, segments[2]);
      }
    }

    if (segments[0] === "api" && segments[1] === "suppliers") {
      const suppliers = dependencies.supplierController ?? supplierController;
      if (segments.length === 2) {
        if (request.method === "POST") {
          return await (suppliers.create ?? supplierController.create)(request);
        }
        return await (suppliers.list ?? supplierController.list)(request);
      }
      if (segments.length >= 3 && segments[2]) {
        if (request.method === "PATCH" || request.method === "PUT") {
          return await (suppliers.update ?? supplierController.update)(request, segments[2]);
        }
        return await (suppliers.getById ?? supplierController.getById)(request, segments[2]);
      }
    }

    if (segments[0] === "api" && segments[1] === "purchase-orders") {
      const purchaseOrders = dependencies.purchaseOrderController ?? purchaseOrderController;
      if (segments.length === 2) {
        if (request.method === "POST") {
          return await (purchaseOrders.create ?? purchaseOrderController.create)(request);
        }
        return await (purchaseOrders.list ?? purchaseOrderController.list)(request);
      }
      if (segments.length >= 4 && segments[2] && segments[3] === "items") {
        if (request.method === "POST") {
          return await (purchaseOrders.addItem ?? purchaseOrderController.addItem)(request, segments[2]);
        }
      }
      if (segments.length >= 4 && segments[2] && segments[3] === "status") {
        if (request.method === "PATCH" || request.method === "PUT") {
          return await (purchaseOrders.updateStatus ?? purchaseOrderController.updateStatus)(request, segments[2]);
        }
      }
      if (segments.length >= 3 && segments[2]) {
        return await (purchaseOrders.getById ?? purchaseOrderController.getById)(request, segments[2]);
      }
    }

    if (segments[0] === "api" && segments[1] === "reports" && segments[2] === "inventory-summary") {
      return await (dependencies.reportController?.inventorySummary ?? reportController.inventorySummary)(request);
    }

    if (segments[0] === "api" && segments[1] === "intelligence" && segments[2] === "inventory-recommendations") {
      return await (dependencies.intelligenceController?.inventoryRecommendations ?? intelligenceController.inventoryRecommendations)(request);
    }

    if (dependencies.onNotFound) {
      return await dependencies.onNotFound(request);
    }

    return jsonErrorResponse("not_found", "Endpoint not found", 404);
  } catch (error) {
    if (error instanceof ApiError) {
      const response = jsonErrorResponse(
        typeof error.details === "object" && error.details !== null && "code" in error.details
          ? String((error.details as Record<string, unknown>).code)
          : "api_error",
        error.message,
        error.statusCode || 500,
      );
      return url.pathname === "/api/agent/query" ? withAgentCors(request, response) : response;
    }

    console.error(error);
    return jsonErrorResponse("internal_error", "An internal error occurred", 500);
  }
}
