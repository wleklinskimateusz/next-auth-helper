import { SignJWT, jwtVerify } from "jose";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { getError } from "../errors/error-utils.js";
import { InternalServerError } from "../errors/internal-server.js";

const getEncodedKey = Result.fromThrowable(
  (secretKey: string) => new TextEncoder().encode(secretKey),
  getError("Unknown error while encoding secret key", InternalServerError)
);

const safeJwtVerify = ResultAsync.fromThrowable(
  (session: string, encodedKey) =>
    jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    }),
  getError("Failed to verify session", InternalServerError)
);

export async function encrypt(
  payload: Record<string, unknown>,
  secretKey: string
) {
  const encodedKeyResult = getEncodedKey(secretKey);
  if (encodedKeyResult.isErr()) return err(encodedKeyResult.error);

  const encrypted = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKeyResult.value);

  return ok(encrypted);
}

export async function decrypt(
  session: string | undefined = "",
  secretKey: string
) {
  const encodedKeyResult = getEncodedKey(secretKey);
  if (encodedKeyResult.isErr()) return err(encodedKeyResult.error);

  const verifyResult = await safeJwtVerify(session, encodedKeyResult.value);
  if (verifyResult.isErr()) {
    return err(verifyResult.error);
  }
  const {
    value: { payload },
  } = verifyResult;

  return ok(payload as unknown);
}

export async function createSession(userId: number, secretKey: string) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const session = await encrypt({ userId, expiresAt }, secretKey);
  if (session.isErr()) return err(session.error);

  return ok({ session: session.value, expiresAt });
}
