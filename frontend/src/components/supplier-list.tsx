import { Link } from "@tanstack/react-router";
import type { Supplier } from "@/lib/supplier-data";

const unavailable = "Unavailable";

export function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) {
    return <p>No suppliers are available for this organization.</p>;
  }

  return (
    <section aria-labelledby="supplier-list-heading">
      <h2 id="supplier-list-heading">Suppliers</h2>
      <ul>
        {suppliers.map((supplier) => (
          <li key={supplier.id}>
            <h3>
              <Link to="/suppliers/$supplierId" params={{ supplierId: supplier.id }}>
                {supplier.name || unavailable}
              </Link>
            </h3>
            <p>Category: {supplier.category || unavailable}</p>
            <p>Status: {supplier.status || unavailable}</p>
            <p>Contact email: {supplier.contact_email || unavailable}</p>
            <p>
              On-time rate:{" "}
              {supplier.on_time_rate === null || supplier.on_time_rate === undefined
                ? unavailable
                : `${supplier.on_time_rate}%`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
