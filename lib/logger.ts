/**
 * Server-side logger that strips sensitive data from error objects.
 * Only the error message is logged — not stack traces or DB internals —
 * to prevent leaking table names, query parameters, or connection strings.
 */

function safeMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Unknown error';
}

export const logger = {
  error(context: string, e: unknown) {
    // In development, log the full error for easier debugging.
    // In production, log only the message to avoid leaking DB internals.
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, e);
    } else {
      console.error(`[${context}]`, safeMessage(e));
    }
  },
};
