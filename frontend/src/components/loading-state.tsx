export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <p role="status" aria-live="polite">{label}</p>;
}
