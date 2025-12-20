import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { insertDocumentSchema } from "@shared/schema";
import { z } from "zod";
import { resolveParams } from "@/lib/route-helpers";

export async function GET(
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
    const document = await storage.getDocument(id, user);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verificar permissão de edição
    if (!["editor", "admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Edit permission required" },
        { status: 403 }
      );
    }

    const existingDoc = await storage.getDocument(id, user);
    if (!existingDoc) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const partialSchema = insertDocumentSchema.partial();
    const validatedData = partialSchema.parse({
      ...body,
      authorId: user.id,
      authorName: user.username,
    });

    const document = await storage.updateDocument(id, validatedData);

    if (document) {
      await storage.createAuditLog({
        documentId: document.id,
        userId: user.id,
        userName: user.username,
        action: "updated",
        details: `Updated document: ${document.title}`,
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

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

    // Verificar permissão de admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin permission required" },
        { status: 403 }
      );
    }

    const document = await storage.getDocument(id, user);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    await storage.createAuditLog({
      documentId: document.id,
      userId: user.id,
      userName: user.username,
      action: "deleted",
      details: `Deleted document: ${document.title}`,
    });

    const deleted = await storage.deleteDocument(id);
    if (deleted) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

