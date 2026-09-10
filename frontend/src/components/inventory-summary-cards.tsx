import type { InventorySummary } from "@/lib/intelligence-data";
import { formatFillRate } from "@/lib/intelligence-data";

export function InventorySummaryCards({ summary }: { summary: InventorySummary }) {
  const cards = [
    ["Total products", summary.totalProducts],
    ["Total stock", summary.totalStock],
    ["Low-stock products", summary.lowStockCount],
    ["Overstock products", summary.overstockCount],
    ["Expiring soon", summary.expiringSoonCount],
    ["Average fill rate", formatFillRate(summary.averageFillRate)],
  ] as const;

  return (
    <section aria-labelledby="inventory-summary-heading">
      <h2 id="inventory-summary-heading">Inventory summary</h2>
      <div>
        {cards.map(([label, value]) => (
          <article key={label}>
            <h3>{label}</h3>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
