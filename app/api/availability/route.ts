import { getDb } from "@/lib/db";
import { loadAvailability } from "@/lib/availability";
import { sessionFromRequest } from "@/lib/portal-auth";
import { failure, ok } from "@/lib/server";

export const runtime = "nodejs";

/**
 * GET /api/availability — the availability calendar as JSON: free stock per day
 * for the next two weeks. Internal accounts only (admins and staff).
 */
export async function GET(request: Request): Promise<Response> {
  const session = sessionFromRequest(request);
  if (!session) return failure(401, "Sign in to the portal first.");
  if (session.role === "client") {
    return failure(403, "Only DWH staff can read the availability calendar.");
  }

  const db = getDb();
  if (!db) return failure(503, "Availability is unavailable — no database is configured.");

  const availability = await loadAvailability(db);
  return ok({ ok: true, ...availability });
}
