import type { Product } from "@/lib/inventory-data";
import { StatusPill, StockBar } from "@/components/ui-parts";

const unavailable = "Unavailable";

export function getSupplierDisplay(product: Product): { name: string; category: string } {
  const supplier = product.suppliers;
  return {
    name: supplier?.name || product.supplier_id || unavailable,
    category: supplier?.category || unavailable,
  };
}

export function ProductDetailView({ product }: { product: Product }) {
  const expiry = product.expires_at ? new Date(product.expires_at).toLocaleString() : unavailable;
  const supplier = getSupplierDisplay(product);
  return (
    <section aria-labelledby="product-detail-heading">
      <h1 id="product-detail-heading">{product.name || unavailable}</h1>
      <dl>
        <div><dt>SKU</dt><dd>{product.sku || unavailable}</dd></div>
        <div><dt>Brand</dt><dd>{product.brand || unavailable}</dd></div>
        <div><dt>Department</dt><dd>{product.department || unavailable}</dd></div>
        <div><dt>Aisle</dt><dd>{product.aisle || unavailable}</dd></div>
        <div><dt>Current stock</dt><dd>{product.stock ?? unavailable}</dd></div>
        <div><dt>Capacity</dt><dd>{product.capacity ?? unavailable}</dd></div>
        <div><dt>Velocity</dt><dd>{product.velocity || unavailable}</dd></div>
        <div><dt>Demand trend</dt><dd>{product.demand_trend ?? unavailable}</dd></div>
        <div><dt>Expiry</dt><dd>{expiry}</dd></div>
        <div><dt>Unit cost</dt><dd>{product.unit_cost ?? unavailable}</dd></div>
        <div><dt>Status</dt><dd>{product.status ? <StatusPill status={product.status} /> : unavailable}</dd></div>
        <div><dt>Expiring soon</dt><dd>{product.isExpiring === undefined ? unavailable : product.isExpiring ? "Yes" : "No"}</dd></div>
        <div><dt>Supplier</dt><dd>{supplier.name}</dd></div>
        <div><dt>Supplier category</dt><dd>{supplier.category}</dd></div>
      </dl>
      <StockBar stock={product.stock} capacity={product.capacity} />
    </section>
  );
}
