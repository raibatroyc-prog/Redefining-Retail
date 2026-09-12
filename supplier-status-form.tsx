import { useState, type FormEvent } from "react";
import { useUpdateSupplier } from "@/hooks/use-supplier-mutations";
import type { Supplier } from "@/lib/supplier-data";

const STATUS_VALUES = ["on-time", "delayed", "at-risk"] as const;

/**
 * Manager/Admin business-record management form: update a supplier's
 * delivery-performance status and on-time rate. Only rendered for
 * `owner`/`manager` roles; the backend enforces the same restriction.
 */
export function SupplierStatusForm({
  organizationId,
  supplier,
}: {
  organizationId: string | null;
  supplier: Supplier;
}) {
  const [status, setStatus] = useState<(typeof STATUS_VALUES)[number]>(
    (supplier.status as (typeof STATUS_VALUES)[number]) || "on-time",
  );
  const [onTimeRate, setOnTimeRate] = useState(supplier.on_time_rate?.toString() ?? "");
  const mutation = useUpdateSupplier(organizationId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedRate = onTimeRate === "" ? undefined : Number(onTimeRate);
    mutation.mutate({ supplierId: supplier.id, status, onTimeRate: parsedRate });
  }

  return (
    <form aria-label="Update supplier status" onSubmit={handleSubmit}>
      <h2>Update supplier status</h2>
      <div>
        <label htmlFor="supplier-status">Status</label>
        <select id="supplier-status" value={status} onChange={(event) => setStatus(event.target.value as (typeof STATUS_VALUES)[number])}>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="supplier-on-time-rate">On-time rate (%)</label>
        <input
          id="supplier-on-time-rate"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={onTimeRate}
          onChange={(event) => setOnTimeRate(event.target.value)}
        />
      </div>
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The supplier could not be updated."}</p>}
      {mutation.isSuccess && <p role="status">Supplier updated.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
