import { describe, test, expect } from "bun:test";
import { PasswordService, type HashedPassword } from "./password-service.js";

describe("PasswordService", () => {
  test("should hash and compare passwords", async () => {
    const authService = new PasswordService();
    const password = "P@ssw0rd";
    const hashedPassword = await authService.hashPassword(password);

    hashedPassword satisfies HashedPassword;

    const result = await authService.comparePasswords(password, hashedPassword);

    expect(result).toBeTrue();
  });

  test("should return false for password mismatch", async () => {
    const authService = new PasswordService();
    const hashedPassword = await authService.hashPassword("P@ssw0rd");

    hashedPassword satisfies HashedPassword;

    const result = await authService.comparePasswords(
      "password",
      hashedPassword,
    );

    expect(result).toBeFalse();
  });

  test("should success for different instances of service", async () => {
    const firstService = new PasswordService();
    const secondService = new PasswordService();
    const password = "P@ssw0rd";
    const hashedPassword = await firstService.hashPassword(password);

    hashedPassword satisfies HashedPassword;

    const result = await secondService.comparePasswords(
      password,
      hashedPassword,
    );

    expect(result).toBeTrue();
  });

  test("should not create the same hash for different salts rounds", async () => {
    const service1 = new PasswordService(11);
    const service2 = new PasswordService(9);
    const password = "P@ssw0rd";
    const hashedPassword1 = await service1.hashPassword(password);
    const hashedPassword2 = await service2.hashPassword(password);
    expect(hashedPassword1).not.toBe(hashedPassword2);
  });

  test("should return the same hash for the same salt", async () => {
    const salt = await PasswordService.generateSalt(5);
    const password = "P@ssw0rd";

    const service1 = new PasswordService(salt);
    const service2 = new PasswordService(salt);

    const hashedPassword1 = await service1.hashPassword(password);
    const hashedPassword2 = await service2.hashPassword(password);

    expect(hashedPassword1).toBe(hashedPassword2);
  });
});
