import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  sectionId: z.string().nullable().optional(),
  sectionText: z.string().nullable().optional(),
});

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

    const comments = await storage.getComments(id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const validationResult = commentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid comment data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { content, sectionId, sectionText } = validationResult.data;
    const comment = await storage.createComment({
      documentId: id,
      authorId: user.id,
      authorName: user.username,
      content,
      sectionId: sectionId || null,
      sectionText: sectionText || null,
      resolved: "false",
    });

    await storage.createAuditLog({
      documentId: id,
      userId: user.id,
      userName: user.username,
      action: "commented",
      details: `Added comment on document: ${document.title}`,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

