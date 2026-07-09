import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-this-in-production-secret-key-min-32-chars"
);

const SESSION_COOKIE = "kiya_session";

function encodeToArrayBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encodeToArrayBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return new Uint8Array(derivedBits);
}

function toBase64(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function hashPassword(plainPassword: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(plainPassword, salt);
  return `${toBase64(salt)}$${toBase64(hash)}`;
}

export async function comparePassword(plainPassword: string, hashedPassword: string) {
  const [saltBase64, hashBase64] = hashedPassword.split("$");
  if (!saltBase64 || !hashBase64) return false;
  const salt = fromBase64(saltBase64);
  const expectedHash = fromBase64(hashBase64);
  const actualHash = await deriveKey(plainPassword, salt);
  if (expectedHash.length !== actualHash.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHash.length; i++) {
    diff |= expectedHash[i] ^ actualHash[i];
  }
  return diff === 0;
}

export async function createToken(payload: {
  userId: string;
  role: string;
  phoneNumber?: string | null;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string; phoneNumber?: string };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifyToken(token);
}
