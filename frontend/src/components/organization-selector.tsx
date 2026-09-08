import { useState } from "react";
import { useCurrentOrg } from "@/hooks/use-current-org";

export function OrganizationSelector() {
  const { organizations, organizationId, selectOrganization } = useCurrentOrg();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (organizations.length === 0) return null;

  async function handleChange(nextOrganizationId: string) {
    setError(null);
    setIsSaving(true);
    try {
      await selectOrganization(nextOrganizationId);
    } catch {
      setError("The organization could not be selected.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <label htmlFor="organization-selector">Organization</label>
      <select
        id="organization-selector"
        value={organizationId ?? ""}
        disabled={isSaving}
        onChange={(event) => void handleChange(event.target.value)}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
