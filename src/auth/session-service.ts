import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { CommonError } from "../common-error.js";

export class SessionService<T extends z.ZodSchema> {
  private static alorithm = "HS256";
  static expirationTimeDays = 7;
  private payloadSchema: z.Schema<z.infer<T> & { expiresAt: number }>;

  private encodedKey: Uint8Array;

  constructor(secretKey: string, payloadSchema: T) {
    this.encodedKey = new TextEncoder().encode(secretKey);
    this.payloadSchema = payloadSchema.and(z.object({ expiresAt: z.number() }));
  }

  createSession(payload: z.infer<T>) {
    const expiresAt = SessionService.getExpirationTimeDate();
    return this.encryptSession({ ...payload, expiresAt });
  }

  async retrievePayload(session: string) {
    const payload = await this.decryptSession(session);
    return this.parsePayload(payload);
  }

  private encryptSession(payload: z.infer<T> & { expiresAt: number }) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: SessionService.alorithm })
      .setIssuedAt()
      .setExpirationTime(SessionService.getExpirationTimeString())
      .sign(this.encodedKey);
  }

  private async decryptSession(session: string | undefined = "") {
    try {
      const result = await jwtVerify(session, this.encodedKey, {
        algorithms: [SessionService.alorithm],
      });
      return result as unknown;
    } catch (e) {
      throw new SessionService.SecretMismatch("provided secret didn't match");
    }
  }

  private parsePayload(session: unknown) {
    const result = this.getSessionSchema().safeParse(session);
    if (!result.success)
      throw new SessionService.WrongSessionPayload(
        "parsing payload failed",
        result.error
      );
    return result.data;
  }

  private getSessionSchema() {
    return z
      .object({
        payload: this.payloadSchema,
      })
      .transform(
        ({ payload }) => payload as z.infer<typeof this.payloadSchema>
      );
  }

  private static getExpirationTimeString() {
    return `${SessionService.expirationTimeDays}d`;
  }

  private static getExpirationTimeDate() {
    return Date.now() + SessionService.expirationTimeDays * 24 * 60 * 60 * 1000;
  }

  static WrongSessionPayload = class extends CommonError {
    override code: 400;
    constructor(message: string, cause?: unknown) {
      super(message, 400);
      this.code = 400;
      this.name = "WrongSessionPayload";
      this.cause = cause;
    }
  };

  static SecretMismatch = class extends CommonError {
    override code: 400;
    constructor(message: string, cause?: unknown) {
      super(message, 400);
      this.code = 400;
      this.name = "SecretMismatch";
      this.cause = cause;
    }
  };
}
