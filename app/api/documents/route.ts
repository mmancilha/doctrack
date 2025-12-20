import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { insertDocumentSchema, searchQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");

    if (query || category || status || authorId) {
      const searchQuery = searchQuerySchema.parse({
        query: query || undefined,
        category: category || undefined,
        status: status || undefined,
        authorId: authorId || undefined,
      });
      const documents = await storage.searchDocuments(searchQuery, user);
      return NextResponse.json(documents);
    } else {
      const documents = await storage.getDocuments(user);
      return NextResponse.json(documents);
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Verificar permissão de edição
    if (!["editor", "admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Edit permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = insertDocumentSchema.parse({
      ...body,
      authorId: user.id,
      authorName: user.username,
    });

    const document = await storage.createDocument(validatedData);

    await storage.createAuditLog({
      documentId: document.id,
      userId: user.id,
      userName: user.username,
      action: "created",
      details: `Created document: ${document.title}`,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

