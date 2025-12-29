import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SessionUser } from "./session";

export interface AuthenticatedRequest extends NextRequest {
  user: SessionUser;
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getSessionUser(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user };
}

export function requireRole(roles: string[]) {
  return async (
    request: NextRequest
  ): Promise<{ user: SessionUser } | { error: NextResponse }> => {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult;
    }

    const { user } = authResult;
    if (!roles.includes(user.role)) {
      return {
        error: NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    return { user };
  };
}

export function canEditDocuments() {
  return requireRole(["editor", "admin"]);
}

export function canDeleteDocuments() {
  return requireRole(["admin"]);
}

