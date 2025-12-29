import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await resolveParams(params);
    const version = await storage.getVersion(id);
    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(version);
  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}

