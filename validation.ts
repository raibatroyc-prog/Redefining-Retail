export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parseInteger(value: string | null, fallback: number, max?: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  if (typeof max === "number" && parsed > max) {
    return max;
  }

  return Math.floor(parsed);
}

export class ValidationError extends Error {
  readonly code: string;
  constructor(message: string, code = "validation_error") {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

/**
 * Safely parses a JSON request body. Throws ValidationError (mapped to a
 * 400 response by callers) instead of letting a raw SyntaxError escape.
 */
export async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    throw new ValidationError("Request body could not be read.", "invalid_body");
  }

  if (!raw.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new ValidationError("Request body must be a JSON object.", "invalid_body");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Request body must be valid JSON.", "invalid_json");
  }
}

export function requireString(body: Record<string, unknown>, field: string, maxLength = 200): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`"${field}" is required.`, "missing_field");
  }
  if (value.length > maxLength) {
    throw new ValidationError(`"${field}" must be ${maxLength} characters or fewer.`, "field_too_long");
  }
  return value.trim();
}

export function optionalString(body: Record<string, unknown>, field: string, maxLength = 500): string | undefined {
  const value = body[field];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new ValidationError(`"${field}" must be a string.`, "invalid_field");
  }
  if (value.length > maxLength) {
    throw new ValidationError(`"${field}" must be ${maxLength} characters or fewer.`, "field_too_long");
  }
  return value.trim();
}

export function requirePositiveNumber(body: Record<string, unknown>, field: string): number {
  const value = Number(body[field]);
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`"${field}" must be a positive number.`, "invalid_field");
  }
  return value;
}

export function optionalNonNegativeNumber(body: Record<string, unknown>, field: string): number | undefined {
  if (body[field] === undefined || body[field] === null || body[field] === "") return undefined;
  const value = Number(body[field]);
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError(`"${field}" must be a non-negative number.`, "invalid_field");
  }
  return value;
}

export function requireEnum<T extends string>(body: Record<string, unknown>, field: string, allowed: readonly T[]): T {
  const value = body[field];
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new ValidationError(`"${field}" must be one of: ${allowed.join(", ")}.`, "invalid_field");
  }
  return value as T;
}

export function parseBoolean(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return null;
}
