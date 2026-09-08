import { formatFreshness } from "@/lib/intelligence-data";

export function DataFreshnessLabel({ generatedAt }: { generatedAt: string }) {
  return <p aria-label="Data freshness">{formatFreshness(generatedAt)}</p>;
}
