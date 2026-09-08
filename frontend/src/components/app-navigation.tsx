import { Link } from "@tanstack/react-router";

export function AppNavigation() {
  return (
    <nav aria-label="Primary navigation">
      <Link to="/dashboard" activeProps={{ "aria-current": "page" }}>Dashboard</Link>{" "}
      <Link to="/inventory" activeProps={{ "aria-current": "page" }}>Inventory</Link>{" "}
      <Link to="/suppliers" activeProps={{ "aria-current": "page" }}>Suppliers</Link>{" "}
      <Link to="/purchase-orders" activeProps={{ "aria-current": "page" }}>Purchase Orders</Link>
    </nav>
  );
}
