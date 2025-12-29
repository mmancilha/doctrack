import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { createSession, setSessionCookie, SessionUser } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const { firstName, lastName, displayName, avatarUrl } = body;

    const updates: { firstName?: string; lastName?: string; displayName?: string; avatarUrl?: string | null } = {};

    if (firstName !== undefined) {
      if (
        typeof firstName === "string" &&
        firstName.trim().length > 0 &&
        firstName.length <= 50
      ) {
        updates.firstName = firstName.trim();
      } else if (firstName === "" || firstName === null) {
        updates.firstName = undefined;
      }
    }

    if (lastName !== undefined) {
      if (
        typeof lastName === "string" &&
        lastName.length <= 50
      ) {
        updates.lastName = lastName.trim() || undefined;
      } else if (lastName === "" || lastName === null) {
        updates.lastName = undefined;
      }
    }

    // Mantido para compatibilidade durante migração
    if (displayName !== undefined) {
      if (
        typeof displayName === "string" &&
        displayName.trim().length > 0 &&
        displayName.length <= 100
      ) {
        updates.displayName = displayName.trim();
      } else if (displayName === "" || displayName === null) {
        updates.displayName = undefined;
      }
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl === null || avatarUrl === "") {
        updates.avatarUrl = null;
      } else if (typeof avatarUrl === "string") {
        // Aceita URLs base64 (data:image/...) ou URLs normais
        if (avatarUrl.startsWith("data:image/")) {
          // Validar tamanho máximo (~2MB em base64)
          if (avatarUrl.length > 3 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Image too large (max 2MB)" },
              { status: 400 }
            );
          }
          updates.avatarUrl = avatarUrl;
        } else {
          // Validação de URL normal
          try {
            new URL(avatarUrl);
            updates.avatarUrl = avatarUrl;
          } catch {
            return NextResponse.json(
              { error: "Invalid avatar URL" },
              { status: 400 }
            );
          }
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const updatedUser = await storage.updateUser(user.id, updates);
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Atualizar sessão com novos dados
    const sessionUser: SessionUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName, // Mantido para compatibilidade
      avatarUrl: updatedUser.avatarUrl,
    };

    const token = await createSession(sessionUser);
    const response = NextResponse.json(sessionUser);
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

