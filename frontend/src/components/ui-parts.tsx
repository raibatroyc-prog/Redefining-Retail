import type { PropsWithChildren } from "react";
import type { StockStatus } from "@/lib/inventory-data";

export function Panel({ children }: PropsWithChildren) {
  return <section>{children}</section>;
}

export function StockBar({ stock, capacity }: { stock: number; capacity: number }) {
  const percentage = capacity > 0 ? Math.min(100, (stock / capacity) * 100) : 0;
  return <progress max={100} value={percentage} aria-label="Stock level" />;
}

export function StatusPill({ status }: { status: StockStatus }) {
  return <span>{status}</span>;
}
