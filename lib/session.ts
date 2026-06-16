export const SESSION_COOKIE_NAME = "ledgerai_session";

type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") {
    return "ledgerai-development-secret-change-before-deploying";
  }
  throw new Error("JWT_SECRET is required in production.");
}

function base64UrlEncode(input: string | ArrayBuffer) {
  const binary =
    typeof input === "string"
      ? input
      : String.fromCharCode(...Array.from(new Uint8Array(input)));

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(padded);
}

async function hmac(data: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return crypto.subtle.sign("HMAC", key, encoder.encode(data));
}

export async function signSessionToken(payload: { userId: string; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({
      sub: payload.userId,
      email: payload.email,
      iat: now,
      exp: now + 60 * 60 * 24 * 7
    } satisfies JwtPayload)
  );
  const unsignedToken = `${header}.${body}`;
  const signature = base64UrlEncode(await hmac(unsignedToken, getSecret()));
  return `${unsignedToken}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<JwtPayload | null> {
  if (!token) return null;

  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expectedSignature = base64UrlEncode(await hmac(`${header}.${body}`, getSecret()));
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;
    if (!payload.sub || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};
