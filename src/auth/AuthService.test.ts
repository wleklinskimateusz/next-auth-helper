import { describe, test, expect } from "bun:test";
import { AuthService } from "./AuthService.js";

describe("AuthService", () => {
  test("create auth service instance", () => {
    const authSerice = new AuthService();
  });
});
