/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

export function runSafe(/** @type {Function} */ handler) {
  // TODO handle exception is obsolete with Express 5
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (error) {
      next(error);
    }
  };
}

export function reply(
  /** @type {Response} */ response,
  {
    status = 200,
    headers = { 'Content-Type': 'application/json' },
    body = '',
  } = {},
) {
  response.status(status).header(headers).send(body);
}
