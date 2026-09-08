import { supabase } from "@/integrations/supabase/client";

export interface ApiClientErrorShape {
  code: string;
  message: string;
  status: number;
}

export class ApiClientError extends Error implements ApiClientErrorShape {
  readonly code: string;
  readonly status: number;

  constructor({ code, message, status }: ApiClientErrorShape) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

interface ApiClientDependencies {
  getSession?: () => Promise<{ data: { session: { access_token?: string } | null }; error: Error | null }>;
  fetch?: typeof globalThis.fetch;
}

function createApiError(code: string, message: string, status = 0): ApiClientError {
  return new ApiClientError({ code, message, status });
}

function parseErrorPayload(payload: unknown, status: number): ApiClientError {
  if (payload && typeof payload === "object") {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const code = typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : "api_error";
      const message = typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "The request could not be completed.";
      return createApiError(code, message, status);
    }
  }

  return createApiError("unexpected_response", "The server returned an unexpected response.", status);
}

export async function requestReadOnlyApi<T>(
  path: string,
  organizationId: string | null,
  dependencies: ApiClientDependencies = {},
): Promise<T> {
  const getSession = dependencies.getSession ?? (async () => {
    if (!supabase) {
      return { data: { session: null }, error: null };
    }
    return supabase.auth.getSession();
  });

  let sessionResult: Awaited<ReturnType<NonNullable<ApiClientDependencies["getSession"]>>>;
  try {
    sessionResult = await getSession();
  } catch {
    throw createApiError("session_error", "Your session could not be verified.");
  }

  if (sessionResult.error) {
    throw createApiError("session_error", "Your session could not be verified.");
  }

  const accessToken = sessionResult.data.session?.access_token;
  if (!accessToken) {
    throw createApiError("unauthorized", "Sign in again to continue.", 401);
  }

  if (organizationId) {
    const separator = path.includes("?") ? "&" : "?";
    path = `${path}${separator}organizationId=${encodeURIComponent(organizationId)}`;
  }

  let response: Response;
  try {
    response = await (dependencies.fetch ?? globalThis.fetch)(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-org-id": organizationId ?? "",
      },
    });
  } catch {
    throw createApiError("network_error", "The server could not be reached.");
  }

  const rawBody = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw createApiError("unexpected_response", "The server returned an invalid response.", response.status);
  }

  if (!response.ok) {
    throw parseErrorPayload(payload, response.status);
  }

  return payload as T;
}
