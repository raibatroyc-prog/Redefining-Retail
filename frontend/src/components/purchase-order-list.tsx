import { Link } from "@tanstack/react-router";
import type { PurchaseOrder } from "@/lib/purchase-order-data";

const unavailable = "Unavailable";

function supplierFor(order: PurchaseOrder) {
  return order.suppliers ?? order.supplier ?? null;
}

export function PurchaseOrderList({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  if (purchaseOrders.length === 0) {
    return <p>No purchase orders are available for this organization.</p>;
  }

  return (
    <section aria-labelledby="purchase-order-list-heading">
      <h2 id="purchase-order-list-heading">Purchase orders</h2>
      <ul>
        {purchaseOrders.map((order) => {
          const supplier = supplierFor(order);
          return (
            <li key={order.id}>
              <h3>
                <Link to="/purchase-orders/$purchaseOrderId" params={{ purchaseOrderId: order.id }}>
                  {order.id}
                </Link>
              </h3>
              <p>Supplier: {supplier?.name || order.supplier_id || unavailable}</p>
              <p>Status: {order.status || unavailable}</p>
              <p>Total: {order.total === null || order.total === undefined ? unavailable : order.total}</p>
              <p>Created: {order.created_at ? new Date(order.created_at).toLocaleString() : unavailable}</p>
              <p>Items: {order.purchase_order_items?.length ?? unavailable}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
