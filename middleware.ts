import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso a rotas públicas
  if (pathname === "/login" || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  // Permitir acesso a assets estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  const sessionUser = await getSessionUser(request);

  // Se não autenticado e tentando acessar rota protegida, redirecionar para login
  if (!sessionUser) {
    // Se for rota de API, retornar 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    // Se for rota de página, redirecionar para login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve executar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

