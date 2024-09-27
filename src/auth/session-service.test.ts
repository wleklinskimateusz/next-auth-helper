import { describe, test, expect, beforeEach } from "bun:test";
import { SessionService } from "./session-service.js";
import { BRAND, z } from "zod";

type UserId = number & BRAND<"userId">;

describe("SessionService", () => {
  const schema = getSchema();
  const secret = "secret key";
  type Payload = z.infer<typeof schema>;
  let sessionService: SessionService<z.Schema<Payload>>;

  beforeEach(() => {
    sessionService = new SessionService(secret, schema);
  });

  test("should create session when payload is provided and decode it back", async () => {
    const schema = getSchema();
    const payload = getPayload();

    const sessionService = new SessionService(secret, schema);

    const session = await sessionService.createSession(payload);
    const result = await sessionService.retrievePayload(session);

    result.userId satisfies UserId;

    expect(result).toEqual({
      ...payload,
      expiresAt: expect.any(Number),
    });
  });

  test("should success if encode and decode with different instances of the service", async () => {
    const schema = getSchema();
    const payload = getPayload();

    const secondService = new SessionService(secret, schema);

    const session = await sessionService.createSession(payload);
    const result = await secondService.retrievePayload(session);

    expect(result).toEqual({
      userId: payload.userId,
      expiresAt: expect.any(Number),
    });
  });

  test("should fail with WrongPayload for different payloads", async () => {
    const firstPayload = getPayload();

    const session = await sessionService.createSession(firstPayload);

    const secondSchema = z.object({ user: z.string() });
    const secondService = new SessionService("secret key", secondSchema);

    expect(() => secondService.retrievePayload(session)).toThrowError(
      SessionService.WrongSessionPayload
    );
  });

  test("should fail if different secret is passed", async () => {
    const schema = getSchema();
    const payload = getPayload();

    const session = await sessionService.createSession(payload);

    const secondService = new SessionService("second key", schema);

    expect(() => secondService.retrievePayload(session)).toThrowError(
      SessionService.SecretMismatch
    );
  });

  function getSchema() {
    return z.object({ userId: z.number().brand<"userId">() });
  }

  function getPayload() {
    return { userId: 123 as UserId };
  }
});
