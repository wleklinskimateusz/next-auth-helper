import { describe, test, expect } from "bun:test";
import { SessionService } from "./SessionService.js";
import { BRAND, z } from "zod";

type UserId = number & BRAND<"userId">;

describe("SessionService", () => {
  test("should create session when payload is provided and decode it back", async () => {
    const schema = z.object({ userId: z.number().brand<"userId">() });
    const sessionService = new SessionService("secret key", schema);

    const payload = { userId: 123 as UserId } satisfies z.infer<typeof schema>;

    const session = await sessionService.createSession(payload);
    const result = await sessionService.retrievePayload(session);
    expect(result).toEqual({
      userId: payload.userId,
      expiresAt: expect.any(Number),
    });
  });
});
