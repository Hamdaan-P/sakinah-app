/**
 * Shared error classifier for the Rayah Plus Quran services.
 *
 * The new /quran/* endpoints live only on the feature branch — if the
 * configured backend doesn't have them deployed every request 404s. The bare
 * "API error 404: Not Found" message that bubbles up from `authPost` is
 * useless to the user. This helper turns it into a typed error the UI can
 * render with actionable guidance.
 */

export class BackendEndpointMissingError extends Error {
  readonly path: string;
  constructor(path: string) {
    super(
      `The Rayah Plus Quran endpoints are not deployed on the configured backend (${path} returned 404). ` +
        'Deploy the feature/rayah-plus-quran branch to your backend or run the backend locally and point VITE_BACKEND_URL at it.',
    );
    this.name = 'BackendEndpointMissingError';
    this.path = path;
  }
}

export class BackendUnreachableError extends Error {
  constructor(path: string) {
    super(
      `Could not reach the backend at ${path}. Check that the backend is running and VITE_BACKEND_URL is set correctly.`,
    );
    this.name = 'BackendUnreachableError';
  }
}

/**
 * Turn a raw `authPost` / `authGet` rejection into a typed Quran-services error.
 * Pass the original error and the endpoint path; the helper inspects the
 * message and either rethrows a typed error or the original.
 */
export function classifyApiError(e: unknown, path: string): Error {
  if (e instanceof BackendEndpointMissingError || e instanceof BackendUnreachableError) {
    return e;
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (/API error 404/.test(msg)) return new BackendEndpointMissingError(path);
  if (/Failed to fetch|NetworkError|timeout|aborted/i.test(msg)) return new BackendUnreachableError(path);
  return e instanceof Error ? e : new Error(msg);
}
