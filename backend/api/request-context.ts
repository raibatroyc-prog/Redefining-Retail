export interface RequestContext {
  request: Request;
  userId: string | null;
  organizationId: string | null;
  claims: Record<string, unknown>;
  isAuthenticated: boolean;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function resolveOrganizationIdFromRequest(request: Request): string | null {
  const header =
    request.headers.get("x-org-id") ??
    request.headers.get("x-organization-id") ??
    null;

  if (header) {
    return header;
  }

  try {
    const url = new URL(request.url);
    const candidate =
      url.searchParams.get("organizationId") ??
      url.searchParams.get("orgId") ??
      null;

    return candidate;
  } catch {
    return null;
  }
}

export function createRequestContext({
  request,
  userId = null,
  organizationId = null,
  claims = {},
}: {
  request: Request;
  userId?: string | null;
  organizationId?: string | null;
  claims?: Record<string, unknown>;
}): RequestContext {
  return {
    request,
    userId,
    organizationId,
    claims,
    isAuthenticated: Boolean(userId),
  };
}
