/**
 * The backend reports every error as
 * `{ code, message, details, trace_id }`; this turns one into text for the user.
 */

interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: { errors?: Array<{ msg?: string }> };
  trace_id?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { status?: number; data?: unknown } })?.response;
  const body = response?.data as ApiErrorBody | undefined;
  if (!body || typeof body !== "object" || typeof body.message !== "string") {
    return fallback;
  }

  const fieldErrors = body.details?.errors?.map((e) => e.msg).filter(Boolean);
  if (body.code === "VALIDATION_ERROR" && fieldErrors?.length) {
    return fieldErrors.join(", ");
  }

  // Server-side failures carry a reference the user can pass on for log lookup
  if ((response?.status ?? 0) >= 500 && body.trace_id) {
    return `${body.message} (ref: ${body.trace_id})`;
  }
  return body.message;
}
