import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { insertCustomCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const categories = await storage.getCustomCategories(user.id);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching custom categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom categories" },
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
    const body = await request.json();
    const validatedData = insertCustomCategorySchema.parse({
      ...body,
      userId: user.id,
    });

    const category = await storage.createCustomCategory(validatedData);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid category data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating custom category:", error);
    return NextResponse.json(
      { error: "Failed to create custom category" },
      { status: 500 }
    );
  }
}

