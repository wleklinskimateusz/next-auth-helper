import { describe, it, expect, spyOn } from "bun:test";
import { decrypt, encrypt } from "./session.js";
import * as jose from "jose";

describe("JWT encryption", () => {
  const payload = {
    userId: 1234,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
  };

  it("should encrypt and decrypt payload", async () => {
    const encrypted = await encrypt(payload, "secret");
    if (encrypted.isErr()) throw new Error("should not happen");

    const decrypted = await decrypt(encrypted.value, "secret");
    if (decrypted.isErr()) throw new Error("should not happen");

    decrypted.value satisfies unknown;

    const { userId, expiresAt } = decrypted.value as {
      userId: number;
      expiresAt: number;
    };

    expect(userId).toBe(payload.userId);
    expect(expiresAt).toBe(payload.expiresAt);
  });
});
