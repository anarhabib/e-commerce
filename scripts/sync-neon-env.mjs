import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { parseEnv } from "node:util";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = [".env", ".env.local"]
  .map((name) => resolve(root, name))
  .find(existsSync);
if (!source)
  throw new Error(
    "Run neon env pull first to create the root Neon environment file.",
  );
const neon = parseEnv(readFileSync(source, "utf8"));
const apiPath = resolve(root, "apps/api/.env");
const webPath = resolve(root, "apps/web/.env.local");
const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");
const apiText = read(apiPath);
const webText = read(webPath);
const api = parseEnv(apiText);
const web = parseEnv(webText);
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "NEON_AUTH_BASE_URL",
  "NEON_REALTIME_URL",
  "NEON_REALTIME_SECRET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_ENDPOINT_URL_S3",
  "AWS_REGION",
]) {
  if (!neon[key])
    throw new Error(`Missing ${key}; check neon.ts and run neon env pull.`);
}
const originSecret =
  api.API_ORIGIN_SECRET ||
  web.API_ORIGIN_SECRET ||
  randomBytes(48).toString("hex");
const cookieSecret =
  web.NEON_AUTH_COOKIE_SECRET || randomBytes(48).toString("hex");
function update(path, text, values) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${JSON.stringify(value)}`;
    const pattern = new RegExp(
      `^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=[^\\r\\n]*`,
      "m",
    );
    text = pattern.test(text)
      ? text.replace(pattern, () => line)
      : `${text}${text && !text.endsWith("\n") ? newline : ""}${line}${newline}`;
  }
  writeFileSync(path, text, { mode: 0o600 });
  console.log(
    `Updated ${path.endsWith(".env.local") ? "web" : "API"} environment keys: ${Object.keys(values).join(", ")} (values hidden)`,
  );
}
update(apiPath, apiText, {
  DATABASE_URL: neon.DATABASE_URL,
  DIRECT_URL: neon.DATABASE_URL_UNPOOLED,
  ...Object.fromEntries(
    [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_ENDPOINT_URL_S3",
      "AWS_REGION",
      "NEON_REALTIME_URL",
      "NEON_REALTIME_SECRET",
    ].map((key) => [key, neon[key]]),
  ),
  MEDIA_BUCKET: "assets",
  API_ORIGIN_SECRET: originSecret,
});
const hosted = process.argv.includes("--hosted-api");
if (hosted && !neon.NEON_FUNCTION_HELLO_BASE_URL)
  throw new Error("Missing deployed API URL; run neon deploy first.");
update(webPath, webText, {
  NEON_AUTH_BASE_URL: neon.NEON_AUTH_BASE_URL,
  NEON_AUTH_COOKIE_SECRET: cookieSecret,
  API_ORIGIN_SECRET: originSecret,
  ...(hosted
    ? { API_URL: neon.NEON_FUNCTION_HELLO_BASE_URL.replace(/\/$/, "") }
    : {}),
});
