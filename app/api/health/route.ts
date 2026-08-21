export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { name: "certilys-admin-panel", status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
