import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(["admin"])(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const users = await storage.getUsers();
    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      }))
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(["admin"])(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role: role || "reader",
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

