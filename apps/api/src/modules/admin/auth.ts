import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { FastifyRequest, FastifyReply } from "fastify";

const lifetime = 8 * 60 * 60;
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function config() {
  const {
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD_HASH: hash,
    ADMIN_SESSION_SECRET: secret,
  } = process.env;
  if (!email || !hash || !secret || secret.length < 32) return null;
  return { email, hash, secret };
}
export function signIn(email: string, password: string) {
  const settings = config();
  if (!settings) return null;
  const [salt, digest] = settings.hash.split(":");
  if (!salt || !digest || !/^[a-f0-9]{128}$/.test(digest)) return null;
  const actual = scryptSync(password, salt, 64);
  const valid = timingSafeEqual(actual, Buffer.from(digest, "hex"));
  if (!valid || email.toLowerCase() !== settings.email.toLowerCase())
    return null;
  const payload = Buffer.from(
    JSON.stringify({
      email: settings.email,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + lifetime,
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", settings.secret).update(payload).digest("base64url")}`;
}
export function isAdmin(token: string) {
  const settings = config();
  if (!settings || token.length > 2048) return false;
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;
    const expected = createHmac("sha256", settings.secret)
      .update(payload)
      .digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      data.role === "admin" &&
      data.email === settings.email &&
      Number.isFinite(data.exp) &&
      data.exp > Date.now() / 1000
    );
  } catch {
    return false;
  }
}
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ") || !isAdmin(header.slice(7))) {
    return reply.status(401).send({ error: "Owner sign-in required" });
  }
}
