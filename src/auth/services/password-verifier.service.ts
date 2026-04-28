import { createHash, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";

const SHA256_PREFIX = "sha256:";

@Injectable()
export class PasswordVerifierService {
  hash(rawPassword: string): string {
    return `${SHA256_PREFIX}${this.toSha256Hex(rawPassword)}`;
  }

  verify(rawPassword: string, storedPassword: string): boolean {
    if (storedPassword.startsWith(SHA256_PREFIX)) {
      const storedHexHash = storedPassword.slice(SHA256_PREFIX.length);
      if (!/^[a-f0-9]{64}$/i.test(storedHexHash)) {
        return false;
      }

      const rawHash = this.toSha256Buffer(rawPassword);
      const storedHash = Buffer.from(storedHexHash, "hex");
      return timingSafeEqual(rawHash, storedHash);
    }

    // Backward-compatible comparison for legacy plain-text stored passwords.
    const rawHash = this.toSha256Buffer(rawPassword);
    const storedHash = this.toSha256Buffer(storedPassword);
    return timingSafeEqual(rawHash, storedHash);
  }

  private toSha256Buffer(value: string): Buffer {
    return Buffer.from(this.toSha256Hex(value), "hex");
  }

  private toSha256Hex(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
