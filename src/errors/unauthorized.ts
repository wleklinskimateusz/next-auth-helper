import { CommonError } from "./common.js";

export class Unauthorized extends CommonError {
  override code: 401;
  constructor(message: string) {
    super(message, 401);
    this.code = 401;
    this.name = "Unauthorized";
  }
}
