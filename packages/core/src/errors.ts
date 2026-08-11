/**
 * Base class for every Tesera error. Carries a machine-readable `code` and an
 * HTTP-ish `status` so transports (the SDK, a future HTTP server) can map them
 * onto responses without string matching, plus an optional `details` payload.
 */
export class TeseraError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { code?: string; status?: number; details?: unknown } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.code = options.code ?? "tesera_error";
    this.status = options.status ?? 500;
    this.details = options.details;
  }
}

/** Input failed schema validation. */
export class ValidationError extends TeseraError {
  constructor(message: string, details?: unknown) {
    super(message, { code: "validation_error", status: 422, details });
  }
}

/** A record was requested by id/filter but does not exist. */
export class NotFoundError extends TeseraError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`, {
      code: "not_found",
      status: 404,
      details: { entity, id },
    });
  }
}

/** The actor lacks permission for the attempted action. */
export class ForbiddenError extends TeseraError {
  constructor(action: string, resource: string) {
    super(`Action "${action}" is not permitted on "${resource}"`, {
      code: "forbidden",
      status: 403,
      details: { action, resource },
    });
  }
}
