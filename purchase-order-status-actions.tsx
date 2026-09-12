import { useUpdatePurchaseOrderStatus, type PurchaseOrderStatus } from "@/hooks/use-purchase-order-mutations";

// Mirrors PO_STATUS_TRANSITIONS in backend/api/controllers/purchase-order.controller.ts
const NEXT_STATUS_LABEL: Record<string, { next: PurchaseOrderStatus; label: string }[]> = {
  draft: [
    { next: "sent", label: "Send to supplier" },
    { next: "cancelled", label: "Cancel order" },
  ],
  sent: [
    { next: "received", label: "Mark received" },
    { next: "cancelled", label: "Cancel order" },
  ],
  received: [],
  cancelled: [],
};

/**
 * Manager/Admin management operation: move a purchase order through its
 * lifecycle. Only the transitions valid for the order's current status
 * are shown; the backend enforces the same state machine, so an invalid
 * transition is rejected even if this UI were bypassed.
 */
export function PurchaseOrderStatusActions({
  organizationId,
  purchaseOrderId,
  status,
}: {
  organizationId: string | null;
  purchaseOrderId: string;
  status: string | null;
}) {
  const mutation = useUpdatePurchaseOrderStatus(organizationId, purchaseOrderId);
  const options = NEXT_STATUS_LABEL[status ?? ""] ?? [];

  if (options.length === 0) {
    return <p>No further status changes are available for this purchase order.</p>;
  }

  return (
    <section aria-label="Update purchase order status">
      <h2>Update status</h2>
      {options.map((option) => (
        <button
          key={option.next}
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(option.next)}
        >
          {option.label}
        </button>
      ))}
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The status could not be updated."}</p>}
      {mutation.isSuccess && <p role="status">Status updated.</p>}
    </section>
  );
}
