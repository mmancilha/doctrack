import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Buscar usuário completo do banco para garantir que temos avatarUrl atualizado
  // (o JWT pode não ter avatarUrl se for muito grande)
  const fullUser = await storage.getUser(sessionUser.id);
  
  if (!fullUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Retornar dados do usuário completo (incluindo avatarUrl do banco)
  return NextResponse.json({
    id: fullUser.id,
    username: fullUser.username,
    role: fullUser.role,
    firstName: fullUser.firstName ?? null,
    lastName: fullUser.lastName ?? null,
    displayName: fullUser.displayName ?? null, // Mantido para compatibilidade
    avatarUrl: fullUser.avatarUrl ?? null,
  });
}

