import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { insertCustomClientSchema } from "@shared/schema";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const clients = await storage.getCustomClients(user.id);
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching custom clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom clients" },
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
    const validatedData = insertCustomClientSchema.parse({
      ...body,
      userId: user.id,
    });

    // Verificar se o cliente já existe para este usuário
    const existingClients = await storage.getCustomClients(user.id);
    const existingClient = existingClients.find(
      c => c.name.toLowerCase() === validatedData.name.toLowerCase()
    );

    if (existingClient) {
      // Se já existe, retornar o existente
      return NextResponse.json(existingClient, { status: 200 });
    }

    const client = await storage.createCustomClient(validatedData);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid client data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating custom client:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create custom client", details: errorMessage },
      { status: 500 }
    );
  }
}

