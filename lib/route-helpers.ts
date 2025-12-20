// Helper para lidar com params que podem ser Promise no Next.js 15
export async function resolveParams<T extends Record<string, string>>(
  params: Promise<T> | T
): Promise<T> {
  if (params && typeof params === "object" && "then" in params) {
    return await params;
  }
  return params as T;
}

