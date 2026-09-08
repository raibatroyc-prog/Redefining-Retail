export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <section aria-labelledby="empty-state-title">
      <h2 id="empty-state-title">{title}</h2>
      <p>{message}</p>
    </section>
  );
}
