import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { findAllContactSubmissions, createContactSubmission } from "@/server/repositories/adminContentRepository";

export async function GET() {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await findAllContactSubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const newSub = await createContactSubmission({ name, email, subject, message });
    return NextResponse.json({ submission: newSub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process contact submission" }, { status: 500 });
  }
}
