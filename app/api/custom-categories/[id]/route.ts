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
    
    // Verificar se a categoria está sendo usada em algum documento
    const documents = await storage.getDocuments(user);
    const isInUse = documents.some(doc => doc.category === id);
    
    if (isInUse) {
      return NextResponse.json(
        { error: "Category is in use and cannot be deleted" },
        { status: 400 }
      );
    }

    const deleted = await storage.deleteCustomCategory(id, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom category:", error);
    return NextResponse.json(
      { error: "Failed to delete custom category" },
      { status: 500 }
    );
  }
}

