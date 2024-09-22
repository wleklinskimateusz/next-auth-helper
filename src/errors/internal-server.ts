import { CommonError } from "./common.js";

export class InternalServerError extends CommonError {
  override code: 500;
  constructor(message: string) {
    super(message, 500);
    this.code = 500;
    this.name = "Internal Server Error";
  }
}
