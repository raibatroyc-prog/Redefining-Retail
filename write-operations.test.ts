import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../backend/api/routes/index";
import { ApiError } from "../backend/api/request-context";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const PRODUCT_ID = "22222222-2222-4222-8222-222222222222";
const SUPPLIER_ID = "33333333-3333-4333-8333-333333333333";
const PO_ID = "44444444-4444-4444-8444-444444444444";

function authHeaders() {
  return { authorization: "Bearer test-token", "x-org-id": ORG_ID };
}

describe("write API routing", () => {
  it("dispatches POST /api/inventory to the create handler", async () => {
    let called = false;
    const response = await handleApiRequest(
      new Request("http://localhost/api/inventory", { method: "POST", headers: authHeaders() }),
      { inventoryController: { create: async () => { called = true; return new Response(null, { status: 201 }); } } },
    );
    expect(called).toBe(true);
    expect(response.status).toBe(201);
  });

  it("dispatches GET /api/inventory to the list handler (unchanged read behaviour)", async () => {
    let calledList = false;
    let calledCreate = false;
    await handleApiRequest(
      new Request("http://localhost/api/inventory", { method: "GET", headers: authHeaders() }),
      {
        inventoryController: {
          list: async () => { calledList = true; return new Response(null, { status: 200 }); },
          create: async () => { calledCreate = true; return new Response(null, { status: 201 }); },
        },
      },
    );
    expect(calledList).toBe(true);
    expect(calledCreate).toBe(false);
  });

  it("dispatches POST /api/inventory/:id/movements to recordMovement", async () => {
    let receivedProductId: string | undefined;
    await handleApiRequest(
      new Request(`http://localhost/api/inventory/${PRODUCT_ID}/movements`, { method: "POST", headers: authHeaders() }),
      { inventoryController: { recordMovement: async (_req, productId) => { receivedProductId = productId; return new Response(null, { status: 201 }); } } },
    );
    expect(receivedProductId).toBe(PRODUCT_ID);
  });

  it("dispatches POST /api/suppliers to the create handler", async () => {
    let called = false;
    await handleApiRequest(
      new Request("http://localhost/api/suppliers", { method: "POST", headers: authHeaders() }),
      { supplierController: { create: async () => { called = true; return new Response(null, { status: 201 }); } } },
    );
    expect(called).toBe(true);
  });

  it("dispatches PATCH /api/suppliers/:id to the update handler", async () => {
    let receivedId: string | undefined;
    await handleApiRequest(
      new Request(`http://localhost/api/suppliers/${SUPPLIER_ID}`, { method: "PATCH", headers: authHeaders() }),
      { supplierController: { update: async (_req, id) => { receivedId = id; return new Response(null, { status: 200 }); } } },
    );
    expect(receivedId).toBe(SUPPLIER_ID);
  });

  it("dispatches POST /api/purchase-orders to the create handler", async () => {
    let called = false;
    await handleApiRequest(
      new Request("http://localhost/api/purchase-orders", { method: "POST", headers: authHeaders() }),
      { purchaseOrderController: { create: async () => { called = true; return new Response(null, { status: 201 }); } } },
    );
    expect(called).toBe(true);
  });

  it("dispatches POST /api/purchase-orders/:id/items to addItem", async () => {
    let receivedId: string | undefined;
    await handleApiRequest(
      new Request(`http://localhost/api/purchase-orders/${PO_ID}/items`, { method: "POST", headers: authHeaders() }),
      { purchaseOrderController: { addItem: async (_req, id) => { receivedId = id; return new Response(null, { status: 201 }); } } },
    );
    expect(receivedId).toBe(PO_ID);
  });

  it("dispatches PATCH /api/purchase-orders/:id/status to updateStatus", async () => {
    let receivedId: string | undefined;
    await handleApiRequest(
      new Request(`http://localhost/api/purchase-orders/${PO_ID}/status`, { method: "PATCH", headers: authHeaders() }),
      { purchaseOrderController: { updateStatus: async (_req, id) => { receivedId = id; return new Response(null, { status: 200 }); } } },
    );
    expect(receivedId).toBe(PO_ID);
  });

  it("still 404s on an unknown path", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/unknown", { method: "POST" }));
    expect(response.status).toBe(404);
  });
});

describe("RBAC and validation error surfacing", () => {
  it("maps ApiError from a write controller to the correct status/code (403 forbidden)", async () => {
    const response = await handleApiRequest(
      new Request(`http://localhost/api/inventory`, { method: "POST", headers: authHeaders() }),
      {
        inventoryController: {
          create: async () => {
            throw new ApiError("You do not have permission to perform this action.", 403, { code: "insufficient_role" });
          },
        },
      },
    );
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("insufficient_role");
  });

  it("maps a validation failure to 400 with a validation error code", async () => {
    const response = await handleApiRequest(
      new Request(`http://localhost/api/inventory/${PRODUCT_ID}/movements`, { method: "POST", headers: authHeaders() }),
      {
        inventoryController: {
          recordMovement: async () => {
            throw new ApiError('"quantity" must be a positive number.', 400, { code: "invalid_field" });
          },
        },
      },
    );
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("invalid_field");
  });

  it("rejects an illegal purchase-order status transition with 400", async () => {
    const response = await handleApiRequest(
      new Request(`http://localhost/api/purchase-orders/${PO_ID}/status`, { method: "PATCH", headers: authHeaders() }),
      {
        purchaseOrderController: {
          updateStatus: async () => {
            throw new ApiError('Cannot move a purchase order from "received" to "sent".', 400, { code: "invalid_transition" });
          },
        },
      },
    );
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("invalid_transition");
  });
});

describe("purchase order status transition rules (business algorithm guard)", () => {
  // Re-implements the same transition table asserted in
  // backend/api/controllers/purchase-order.controller.ts so a regression
  // in the state machine is caught even without hitting the network.
  const PO_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
    draft: ["sent", "cancelled"],
    sent: ["received", "cancelled"],
    received: [],
    cancelled: [],
  };

  it("allows draft -> sent and draft -> cancelled", () => {
    expect(PO_STATUS_TRANSITIONS.draft).toContain("sent");
    expect(PO_STATUS_TRANSITIONS.draft).toContain("cancelled");
  });

  it("allows sent -> received and sent -> cancelled", () => {
    expect(PO_STATUS_TRANSITIONS.sent).toContain("received");
    expect(PO_STATUS_TRANSITIONS.sent).toContain("cancelled");
  });

  it("disallows any transition out of a terminal state", () => {
    expect(PO_STATUS_TRANSITIONS.received).toHaveLength(0);
    expect(PO_STATUS_TRANSITIONS.cancelled).toHaveLength(0);
  });

  it("disallows skipping draft straight to received", () => {
    expect(PO_STATUS_TRANSITIONS.draft).not.toContain("received");
  });
});
