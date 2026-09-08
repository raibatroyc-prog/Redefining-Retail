import type { InventoryFilters } from "@/hooks/use-products";

interface InventoryFiltersProps {
  filters: InventoryFilters;
  categories: string[];
  onChange: (filters: InventoryFilters) => void;
}

export function InventoryFilters({ filters, categories, onChange }: InventoryFiltersProps) {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <label>
        Search
        <input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ ...filters, search: event.target.value, offset: 0 })}
        />
      </label>
      <label>
        Status
        <select
          value={filters.status ?? ""}
          onChange={(event) => onChange({ ...filters, status: event.target.value || undefined, offset: 0 })}
        >
          <option value="">All statuses</option>
          <option value="optimal">Optimal</option>
          <option value="low">Low</option>
          <option value="critical">Critical</option>
          <option value="overstock">Overstock</option>
        </select>
      </label>
      <label>
        Category
        <select
          value={filters.category ?? ""}
          onChange={(event) => onChange({ ...filters, category: event.target.value || undefined, offset: 0 })}
        >
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={filters.lowStock === true}
          onChange={(event) => onChange({ ...filters, lowStock: event.target.checked ? true : undefined, offset: 0 })}
        />
        Low stock only
      </label>
      <label>
        <input
          type="checkbox"
          checked={filters.expiring === true}
          onChange={(event) => onChange({ ...filters, expiring: event.target.checked ? true : undefined, offset: 0 })}
        />
        Expiring soon only
      </label>
    </form>
  );
}
