import type { NextRequest } from "next/server";

export function isAdminAuthorized(request: NextRequest): boolean {
  const provided = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return false;
  }
  return Boolean(provided) && provided === expected;
}
