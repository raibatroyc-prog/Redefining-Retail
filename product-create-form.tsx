import { useState, type FormEvent } from "react";
import { useCreateProduct } from "@/hooks/use-create-product";

/**
 * Manager/Admin business-record management form: add a new product/SKU.
 * Only rendered for `owner`/`manager` roles; the backend enforces the
 * same restriction.
 */
export function ProductCreateForm({ organizationId }: { organizationId: string | null }) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [stock, setStock] = useState("");
  const [capacity, setCapacity] = useState("");
  const mutation = useCreateProduct(organizationId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sku.trim() || !name.trim()) return;
    mutation.mutate(
      {
        sku: sku.trim(),
        name: name.trim(),
        department: department || undefined,
        stock: stock === "" ? undefined : Number(stock),
        capacity: capacity === "" ? undefined : Number(capacity),
      },
      {
        onSuccess: () => {
          setSku("");
          setName("");
          setDepartment("");
          setStock("");
          setCapacity("");
        },
      },
    );
  }

  return (
    <form aria-label="Add product" onSubmit={handleSubmit}>
      <h2>Add product</h2>
      <div>
        <label htmlFor="product-sku">SKU</label>
        <input id="product-sku" type="text" value={sku} onChange={(event) => setSku(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="product-name">Name</label>
        <input id="product-name" type="text" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="product-department">Department</label>
        <input id="product-department" type="text" value={department} onChange={(event) => setDepartment(event.target.value)} />
      </div>
      <div>
        <label htmlFor="product-stock">Initial stock</label>
        <input id="product-stock" type="number" min={0} step={1} value={stock} onChange={(event) => setStock(event.target.value)} />
      </div>
      <div>
        <label htmlFor="product-capacity">Capacity</label>
        <input id="product-capacity" type="number" min={0} step={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} />
      </div>
      {mutation.isError && <p role="alert">{mutation.error instanceof Error ? mutation.error.message : "The product could not be created."}</p>}
      {mutation.isSuccess && <p role="status">Product added.</p>}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
