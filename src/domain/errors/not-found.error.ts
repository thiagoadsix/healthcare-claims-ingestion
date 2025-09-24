export class NotFoundError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}