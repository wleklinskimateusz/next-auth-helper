import { ResultAsync } from "neverthrow";
import type { Brand } from "../type-utils.js";
import bcrypt from "bcrypt";
import { getError } from "../errors/error-utils.js";
import { InternalServerError } from "../errors/internal-server.js";

export type HashedPassword = Brand<string, "hashed">;

const safeHash = ResultAsync.fromThrowable(
  (plainPassword: string, saltOrRounds: number | string) =>
    bcrypt.hash(plainPassword, saltOrRounds) as Promise<HashedPassword>,
  getError("unknown error occured while hashing", InternalServerError)
);

export function hashPassword(
  plainPassword: string,
  saltOrRounds: string | number = 10
) {
  return safeHash(plainPassword, saltOrRounds);
}

const safeCompare = ResultAsync.fromThrowable(
  (toVerify: string, hashedPassword: HashedPassword) =>
    bcrypt.compare(toVerify, hashedPassword),
  getError(
    "unknown error occured while comparing passwords",
    InternalServerError
  )
);

export function comparePasswords(
  toVerify: string,
  hashedPassword: HashedPassword
) {
  return safeCompare(toVerify, hashedPassword);
}
