import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "doctrack-secret-key-change-in-production-min-32-chars-required"
);

export interface SessionUser {
  id: string;
  username: string;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
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
    displayName: user.displayName,
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
    // O payload agora contém os dados diretamente, não em um objeto 'user'
    return payload as SessionUser;
  } catch {
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
