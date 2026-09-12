import { useState, type FormEvent } from "react";
import { useCreatePurchaseOrder } from "@/hooks/use-purchase-order-mutations";
import type { Supplier } from "@/lib/supplier-data";

/**
 * Manager/Admin management form: open a new draft purchase order against
 * one of the organization's suppliers.
 */
export function PurchaseOrderCreateForm({
  organizationId,
  suppliers,
}: {
  organizationId: string | null;
  suppliers: Supplier[];
}) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const mutation = useCreatePurchaseOrder(organizationId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supplierId) return;
    mutation.mutate({ supplierId });
  }

  if (suppliers.length === 0) {
    return <p>Add a supplier before creating a purchase order.</p>;
  }

  return (
    <form aria-label="Create purchase order" onSubmit={handleSubmit}>
      <h2>Create purchase order</h2>
      <div>
        <label htmlFor="po-supplier">Supplier</label>
        <select id="po-supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>{supplier.name || supplier.id}</option>
          ))}
        </select>
      </div>
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The purchase order could not be created."}</p>}
      {mutation.isSuccess && <p role="status">Draft purchase order created.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create draft purchase order"}
      </button>
    </form>
  );
}
