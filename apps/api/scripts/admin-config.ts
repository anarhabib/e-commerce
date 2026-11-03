import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/modules/admin/auth.js";

export function assertOwnerSetupAvailable(existing: string) {
  if (/^ADMIN_PASSWORD_HASH\s*=\s*["']?[^\s"'\r\n]/m.test(existing)) {
    throw new Error(
      "Owner credentials already exist. Setup will not replace them. Use admin:credentials for deliberate credential rotation.",
    );
  }
}

export function ownerConfiguration(
  existing: string,
  email: string,
  password: string,
) {
  assertOwnerSetupAvailable(existing);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /["'\\]/.test(email)) {
    throw new Error("Enter a valid owner email address");
  }
  if (password.length < 12 || password.length > 256) {
    throw new Error("Use a password between 12 and 256 characters");
  }
  const preserved = existing
    .replace(
      /^ADMIN_(?:EMAIL|PASSWORD_HASH|SESSION_SECRET)\s*=.*(?:\r?\n|$)/gm,
      "",
    )
    .trimEnd();
  return `${preserved}\nADMIN_EMAIL="${email}"\nADMIN_PASSWORD_HASH="${hashPassword(password)}"\nADMIN_SESSION_SECRET="${randomBytes(48).toString("hex")}"\n`;
}
