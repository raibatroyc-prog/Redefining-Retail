export function ErrorState({ message = "Something went wrong. Please try again." }: { message?: string }) {
  return <p role="alert">{message}</p>;
}
