import { customerAuth } from "@/lib/customer-auth";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const auth = customerAuth();
  if (!auth)
    return Response.json(
      { error: "Customer accounts are unavailable" },
      { status: 503, headers },
    );
  const { data, error } = await auth.getSession();
  if (error || !data?.user)
    return Response.json(
      { error: "Sign-in required" },
      { status: 401, headers },
    );
  const { id, name, email, emailVerified } = data.user;
  return Response.json({ id, name, email, emailVerified }, { headers });
}
