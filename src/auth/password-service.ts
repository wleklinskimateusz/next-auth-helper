import bcrypt from "bcrypt";
import type { BRAND } from "zod";

export type HashedPassword = string & BRAND<"hashed">;
export type Salt = string & BRAND<"salt">;

export class PasswordService {
  constructor(private saltOrRounds: Salt | number = 10) {}

  hashPassword(password: string) {
    return bcrypt.hash(password, this.saltOrRounds) as Promise<HashedPassword>;
  }

  comparePasswords(password: string, hashedPassword: HashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateSalt(rounds: number) {
    return bcrypt.genSalt(rounds) as Promise<Salt>;
  }
}
