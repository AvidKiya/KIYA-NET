import type { NextRequest } from "next/server";

export function isAdminAuthorized(request: NextRequest): boolean {
  const provided = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_PASSWORD ?? "kiyanet-1404";
  return Boolean(provided) && provided === expected;
}
