import { CommonError } from "./common.js";

export class NotFound extends CommonError {
  override code: 404;
  constructor(message: string) {
    super(message, 404);
    this.code = 404;
    this.name = "Not Found";
  }
}
