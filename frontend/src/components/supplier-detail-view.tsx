import type { Supplier } from "@/lib/supplier-data";

const unavailable = "Unavailable";

export function SupplierDetailView({ supplier }: { supplier: Supplier }) {
  return (
    <section aria-labelledby="supplier-detail-heading">
      <h1 id="supplier-detail-heading">{supplier.name || unavailable}</h1>
      <dl>
        <div><dt>Supplier ID</dt><dd>{supplier.id}</dd></div>
        <div><dt>Category</dt><dd>{supplier.category || unavailable}</dd></div>
        <div><dt>Contact email</dt><dd>{supplier.contact_email || unavailable}</dd></div>
        <div><dt>Status</dt><dd>{supplier.status || unavailable}</dd></div>
        <div>
          <dt>On-time rate</dt>
          <dd>
            {supplier.on_time_rate === null || supplier.on_time_rate === undefined
              ? unavailable
              : `${supplier.on_time_rate}%`}
          </dd>
        </div>
        <div>
          <dt>Next delivery</dt>
          <dd>{supplier.next_delivery ? new Date(supplier.next_delivery).toLocaleString() : unavailable}</dd>
        </div>
      </dl>
    </section>
  );
}
