import { describe, it, expect } from "bun:test";
import { comparePasswords, hashPassword } from "./user.js";

describe("hash function", () => {
  it.each(["P@ssw0rd", "hello", "super long string"])(
    "should hash and successfuly compare password: %s",
    async (key) => {
      const resultHash = await hashPassword(key);

      if (resultHash.isErr()) throw new Error("should not error");
      const hashedPassword = resultHash.value;
      const result = await comparePasswords(key, hashedPassword);
      if (result.isErr()) throw new Error("should not error!");
      expect(result.value).toBeTrue();
    }
  );

  it("should fail with a password that similar to original one", async () => {
    const hashResult = await hashPassword("P@ssw0rd");
    if (hashResult.isErr()) throw new Error("should not fail");
    const hashedPassword = hashResult.value;

    const compareResult = await comparePasswords("P@ssw0000rd", hashedPassword);
    if (compareResult.isErr()) throw new Error("should not fail");

    expect(compareResult.value).toBeFalse();
  });
});
