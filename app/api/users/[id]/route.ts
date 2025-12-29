import { NextRequest, NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authResult = await requireRole(["admin"])(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await resolveParams(params);
    const body = await request.json();
    const { role, password } = body;

    const updates: any = {};
    if (role && ["reader", "editor", "admin"].includes(role)) {
      updates.role = role;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const user = await storage.updateUser(id, updates);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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

    const { user: currentUser } = authResult;
    const { id } = await resolveParams(params);

    // Verificar permissão de admin
    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin permission required" },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await storage.deleteUser(id);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

