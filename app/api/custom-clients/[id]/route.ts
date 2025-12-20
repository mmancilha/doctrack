import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { id } = await resolveParams(params);
    
    // Buscar o cliente customizado para verificar se existe
    const customClients = await storage.getCustomClients(user.id);
    const clientToDelete = customClients.find(c => c.id === id);
    
    if (!clientToDelete) {
      return NextResponse.json(
        { error: "CLIENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verificar se o cliente está sendo usado em algum documento
    const documents = await storage.getDocuments(user);
    const isInUse = documents.some(doc => doc.company === clientToDelete.name);
    
    if (isInUse) {
      return NextResponse.json(
        { error: "CLIENT_IN_USE" },
        { status: 400 }
      );
    }

    // Permitir exclusão se não estiver em uso
    const deleted = await storage.deleteCustomClient(id, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "CLIENT_DELETE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom client:", error);
    return NextResponse.json(
      { error: "CLIENT_DELETE_FAILED" },
      { status: 500 }
    );
  }
}

