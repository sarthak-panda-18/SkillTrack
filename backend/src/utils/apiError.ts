export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public errors?: any[];

  constructor(statusCode: number, message: string, codeOrErrors?: string | any[], errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    if (typeof codeOrErrors === 'string') {
      this.code = codeOrErrors;
      this.errors = errors;
    } else if (Array.isArray(codeOrErrors)) {
      this.code = undefined;
      this.errors = codeOrErrors;
    } else {
      this.code = undefined;
      this.errors = errors;
    }
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
