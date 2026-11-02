import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "palito_session";
export const SESSION_DAYS = 30;

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não está definido no .env");
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: number) {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return typeof payload.uid === "number" ? { userId: payload.uid } : null;
  } catch {
    return null;
  }
}
