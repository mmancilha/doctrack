import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";
import { z } from "zod";

const resolveCommentSchema = z.object({
  resolved: z.enum(["true", "false"]),
});

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

    const body = await request.json();
    const validationResult = resolveCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { resolved } = validationResult.data;
    const comment = await storage.updateComment(id, { resolved });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

