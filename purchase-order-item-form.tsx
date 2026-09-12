import { useState, type FormEvent } from "react";
import { useAddPurchaseOrderItem } from "@/hooks/use-purchase-order-mutations";
import type { Product } from "@/lib/inventory-data";

/**
 * Manager/Admin management form: add a line item (product, quantity,
 * unit cost) to a draft purchase order. Only meaningful while the order
 * is still in "draft" status (also enforced server-side).
 */
export function PurchaseOrderItemForm({
  organizationId,
  purchaseOrderId,
  products,
}: {
  organizationId: string | null;
  purchaseOrderId: string;
  products: Product[];
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const mutation = useAddPurchaseOrderItem(organizationId, purchaseOrderId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    const parsedUnitCost = Number(unitCost);
    if (!productId || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;
    if (!Number.isFinite(parsedUnitCost) || parsedUnitCost <= 0) return;
    mutation.mutate(
      { productId, quantity: parsedQuantity, unitCost: parsedUnitCost },
      { onSuccess: () => { setQuantity(""); setUnitCost(""); } },
    );
  }

  if (products.length === 0) {
    return <p>Add a product to inventory before adding line items.</p>;
  }

  return (
    <form aria-label="Add line item" onSubmit={handleSubmit}>
      <h2>Add line item</h2>
      <div>
        <label htmlFor="po-item-product">Product</label>
        <select id="po-item-product" value={productId} onChange={(event) => setProductId(event.target.value)}>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.name || product.sku || product.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="po-item-quantity">Quantity</label>
        <input id="po-item-quantity" type="number" min={1} step={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="po-item-unit-cost">Unit cost</label>
        <input id="po-item-unit-cost" type="number" min={0.01} step={0.01} value={unitCost} onChange={(event) => setUnitCost(event.target.value)} required />
      </div>
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The line item could not be added."}</p>}
      {mutation.isSuccess && <p role="status">Line item added.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add item"}
      </button>
    </form>
  );
}
