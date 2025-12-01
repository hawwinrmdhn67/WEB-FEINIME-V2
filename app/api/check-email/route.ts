import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { exists: false, message: "Email is required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );

    const data = await res.json();

    if (!data || !Array.isArray(data.users)) {
      return NextResponse.json(
        { exists: false, message: "Invalid response from server" },
        { status: 500 }
      );
    }

    const exists = data.users.some((u: any) => u.email === email);

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("Check email error:", err);
    return NextResponse.json(
      { exists: false, error: "Failed to check email." },
      { status: 500 }
    );
  }
}
