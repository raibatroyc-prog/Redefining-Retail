import { useState, type FormEvent } from "react";
import { useRecordStockMovement, type StockMovementType } from "@/hooks/use-record-stock-movement";

const MOVEMENT_TYPES: StockMovementType[] = ["receipt", "sale", "waste", "adjustment"];

/**
 * User-side data-input form: lets any authenticated org member log a
 * stock transaction against a product (receiving new stock, recording a
 * sale, writing off waste, or making a manual adjustment). This is the
 * write counterpart to the read-only stock movement history list.
 */
export function StockMovementForm({
  organizationId,
  productId,
  currentStock,
}: {
  organizationId: string | null;
  productId: string;
  currentStock: number | null | undefined;
}) {
  const [type, setType] = useState<StockMovementType>("receipt");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const mutation = useRecordStockMovement(organizationId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }
    mutation.mutate(
      { productId, type, quantity: parsedQuantity, note: note || undefined },
      {
        onSuccess: () => {
          setQuantity("");
          setNote("");
        },
      },
    );
  }

  return (
    <form aria-label="Record stock movement" onSubmit={handleSubmit}>
      <h2>Record stock movement</h2>
      <div>
        <label htmlFor="movement-type">Type</label>
        <select id="movement-type" value={type} onChange={(event) => setType(event.target.value as StockMovementType)}>
          {MOVEMENT_TYPES.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="movement-quantity">Quantity</label>
        <input
          id="movement-quantity"
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="movement-note">Note (optional)</label>
        <input id="movement-note" type="text" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      {typeof currentStock === "number" && <p>Current stock on hand: {currentStock}</p>}
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The movement could not be recorded."}</p>}
      {mutation.isSuccess && <p role="status">Stock movement recorded.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Recording..." : "Record movement"}
      </button>
    </form>
  );
}
