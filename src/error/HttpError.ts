export class HttpError extends Error {
  constructor(readonly statusCode: number, readonly body: string) {
    super(body);
  }
}
