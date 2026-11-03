import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/modules/admin/auth.js";
import {
  assertOwnerSetupAvailable,
  ownerConfiguration,
} from "./admin-config.js";

// Password arrives via hidden terminal input, never a command argument or file.
if (!process.stdin.isTTY)
  throw new Error("Run this command in an interactive terminal");
const save = process.argv.includes("--save");
const envPath = new URL("../.env", import.meta.url);
let existing = "";
let email = "";
if (save) {
  existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  assertOwnerSetupAvailable(existing);
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  email = (await prompt.question("Owner email: ")).trim();
  prompt.close();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /["'\\]/.test(email)) {
    throw new Error("Enter a valid owner email address");
  }
}
process.stdout.write("New owner password (12-256 characters; typing shows *): ");
process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
process.stdin.resume();
let password = "";
process.stdin.on("data", (chunk: string) => {
  for (const character of chunk) {
    if (character === "\u0003") process.exit(1);
    if (character === "\r" || character === "\n") {
      process.stdin.setRawMode(false);
      if (password.length < 12 || password.length > 256) {
        process.stderr.write(
          "\nUse a password between 12 and 256 characters.\n",
        );
        process.exit(1);
      }
      const credentials = `ADMIN_PASSWORD_HASH="${hashPassword(password)}"\nADMIN_SESSION_SECRET="${randomBytes(48).toString("hex")}"\n`;
      if (save) {
        // Re-read before saving to preserve configuration edited during the prompt.
        existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
        writeFileSync(envPath, ownerConfiguration(existing, email, password), {
          mode: 0o600,
        });
        process.stdout.write(
          "\nOwner access saved to apps/api/.env. Restart the API, then sign in at http://localhost:3000/admin with the email and password you chose.\n",
        );
      } else {
        process.stdout.write(`\n${credentials}`);
      }
      process.exit(0);
    }
    if (character === "\u007f" || character === "\b") {
      if (password.length) {
        password = password.slice(0, -1);
        process.stdout.write("\b \b");
      }
    } else if (character >= " " && password.length < 256) {
      password += character;
      process.stdout.write("*");
    }
  }
});
