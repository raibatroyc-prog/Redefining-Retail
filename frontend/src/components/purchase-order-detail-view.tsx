import type { PurchaseOrder } from "@/lib/purchase-order-data";

const unavailable = "Unavailable";

export function PurchaseOrderDetailView({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
  const supplier = purchaseOrder.suppliers ?? purchaseOrder.supplier ?? null;
  const items = purchaseOrder.purchase_order_items ?? [];

  return (
    <section aria-labelledby="purchase-order-detail-heading">
      <h1 id="purchase-order-detail-heading">Purchase order {purchaseOrder.id}</h1>
      <dl>
        <div><dt>Status</dt><dd>{purchaseOrder.status || unavailable}</dd></div>
        <div><dt>Supplier</dt><dd>{supplier?.name || purchaseOrder.supplier_id || unavailable}</dd></div>
        <div><dt>Supplier category</dt><dd>{supplier?.category || unavailable}</dd></div>
        <div><dt>Total</dt><dd>{purchaseOrder.total === null || purchaseOrder.total === undefined ? unavailable : purchaseOrder.total}</dd></div>
        <div><dt>Created</dt><dd>{purchaseOrder.created_at ? new Date(purchaseOrder.created_at).toLocaleString() : unavailable}</dd></div>
        <div><dt>Updated</dt><dd>{purchaseOrder.updated_at ? new Date(purchaseOrder.updated_at).toLocaleString() : unavailable}</dd></div>
      </dl>
      <section aria-labelledby="purchase-order-items-heading">
        <h2 id="purchase-order-items-heading">Line items</h2>
        {items.length === 0 ? (
          <p>No line items are available.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <p>Product ID: {item.product_id || unavailable}</p>
                <p>Quantity: {item.qty ?? unavailable}</p>
                <p>Unit cost: {item.unit_cost ?? unavailable}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
