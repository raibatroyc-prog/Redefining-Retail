import type { StockMovement } from "@/hooks/use-stock-movements";

export function StockMovementList({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) {
    return <p>No stock movements are available for this product.</p>;
  }
  return (
    <section aria-labelledby="stock-movements-heading">
      <h2 id="stock-movements-heading">Stock movements</h2>
      <ul>
        {movements.map((movement, index) => (
          <li key={movement.id ?? `${movement.created_at}-${index}`}>
            <strong>{movement.movement_type ?? movement.type ?? "Unknown"}</strong>
            {" — "}{movement.quantity}
            {movement.note && <span> — {movement.note}</span>}
            {movement.actor_id && <span> — Actor {movement.actor_id}</span>}
            <time dateTime={movement.created_at}> ({new Date(movement.created_at).toLocaleString()})</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
