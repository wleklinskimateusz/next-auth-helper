import { describe, test, expect } from "bun:test";
import { SessionService } from "./SessionService.js";
import { BRAND, z } from "zod";

type UserId = number & BRAND<"userId">;

describe("SessionService", () => {
  test("should create session when payload is provided and decode it back", async () => {
    const schema = z.object({ userId: z.number().brand<"userId">() });
    const payload = { userId: 123 as UserId } satisfies z.infer<typeof schema>;

    const sessionService = new SessionService("secret key", schema);

    const session = await sessionService.createSession(payload);
    const result = await sessionService.retrievePayload(session);

    expect(result).toEqual({
      userId: payload.userId,
      expiresAt: expect.any(Number),
    });
  });

  test("should success if encode and decode with different instances of the service", async () => {
    const schema = z.object({ userId: z.number().brand<"userId">() });
    const payload = { userId: 123 as UserId } as const;
    const secret = "secret key";

    const firstService = new SessionService(secret, schema);
    const secondService = new SessionService(secret, schema);

    const session = await firstService.createSession(payload);
    const result = await secondService.retrievePayload(session);

    expect(result).toEqual({
      userId: payload.userId,
      expiresAt: expect.any(Number),
    });
  });

  test("should fail with WrongPayload for different payloads", async () => {
    const firstSchema = z.object({ userId: z.number().brand<"userId">() });
    const firstPayload = { userId: 123 as UserId } as const;
    const firstService = new SessionService("secret key", firstSchema);

    const session = await firstService.createSession(firstPayload);

    const secondSchema = z.object({ user: z.string() });
    const secondService = new SessionService("secret key", secondSchema);

    expect(() => secondService.retrievePayload(session)).toThrowError(
      SessionService.WrongSessionPayload
    );
  });

  test("should fail if different secret is passed", async () => {
    const schema = z.object({ userId: z.number().brand<"userId">() });
    const payload = { userId: 123 as UserId } satisfies z.infer<typeof schema>;

    const firstService = new SessionService("first key", schema);

    const session = await firstService.createSession(payload);

    const secondService = new SessionService("second key", schema);

    expect(() => secondService.retrievePayload(session)).toThrowError(
      SessionService.SecretMismatch
    );
  });
});
