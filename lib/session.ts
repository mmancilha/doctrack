import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

// Validar SESSION_SECRET obrigatório
if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. Please set it in your .env file with at least 32 characters."
  );
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters long for security."
  );
}

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export interface SessionUser {
  id: string;
  username: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null; // Mantido para compatibilidade
  avatarUrl?: string | null;
}

const COOKIE_NAME = "doctrack-session";
const MAX_AGE = 24 * 60 * 60; // 24 hours

export async function createSession(user: SessionUser): Promise<string> {
  // Não armazenar avatarUrl completo no JWT se for muito grande (base64)
  // Armazenar apenas uma referência ou URL curta
  const sessionPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName, // Mantido para compatibilidade
    // Se avatarUrl for base64 muito grande, não incluir no JWT
    // O frontend pode buscar do banco quando necessário
    avatarUrl: user.avatarUrl && user.avatarUrl.length > 200 
      ? null // Não incluir imagens base64 grandes no JWT
      : user.avatarUrl,
  };
  
  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);

  return token;
}

export async function getSessionUser(
  request: NextRequest
): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    // Validar e converter o payload para SessionUser
    if (
      typeof payload === "object" &&
      payload !== null &&
      "id" in payload &&
      "username" in payload &&
      "role" in payload
    ) {
      return {
        id: String(payload.id),
        username: String(payload.username),
        role: String(payload.role),
        firstName: payload.firstName !== undefined ? (payload.firstName as string | null) : null,
        lastName: payload.lastName !== undefined ? (payload.lastName as string | null) : null,
        displayName: payload.displayName !== undefined ? (payload.displayName as string | null) : null,
        avatarUrl: payload.avatarUrl !== undefined ? (payload.avatarUrl as string | null) : null,
      };
    }
    return null;
  } catch (error) {
    console.error("Error verifying session token:", error);
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
    domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Deixar undefined para localhost
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}
