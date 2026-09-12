import { useState, type FormEvent } from "react";
import { useCreateSupplier } from "@/hooks/use-supplier-mutations";

/**
 * Manager/Admin business-record management form: onboard a new supplier.
 * Only rendered for users whose org role is `owner` or `manager` (see
 * suppliers.tsx route), since the backend also enforces this via RBAC.
 */
export function SupplierForm({ organizationId }: { organizationId: string | null }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const mutation = useCreateSupplier(organizationId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    mutation.mutate(
      { name: name.trim(), category: category || undefined, contactEmail: contactEmail || undefined },
      {
        onSuccess: () => {
          setName("");
          setCategory("");
          setContactEmail("");
        },
      },
    );
  }

  return (
    <form aria-label="Add supplier" onSubmit={handleSubmit}>
      <h2>Add supplier</h2>
      <div>
        <label htmlFor="supplier-name">Name</label>
        <input id="supplier-name" type="text" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="supplier-category">Category</label>
        <input id="supplier-category" type="text" value={category} onChange={(event) => setCategory(event.target.value)} />
      </div>
      <div>
        <label htmlFor="supplier-email">Contact email</label>
        <input id="supplier-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
      </div>
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The supplier could not be created."}</p>}
      {mutation.isSuccess && <p role="status">Supplier added.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add supplier"}
      </button>
    </form>
  );
}
