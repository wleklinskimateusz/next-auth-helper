import type { CommonError } from "./common.js";

export function getError<TError extends CommonError>(
  fallbackMessage: string = "Unknown Error occured",
  ErrorClass: new (...args: any[]) => TError
) {
  return (e: unknown) => {
    if (e instanceof Error) {
      const error = new ErrorClass(e.message);
      error.cause = e;
      return error;
    }
    if (typeof e === "string") {
      const error = new ErrorClass(e);
      error.cause = e;
      return error;
    }
    const error = new ErrorClass(fallbackMessage);
    error.cause = e;
    return error;
  };
}
