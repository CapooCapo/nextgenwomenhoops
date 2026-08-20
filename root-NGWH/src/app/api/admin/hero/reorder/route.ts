import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { reorderHeroSlides } from "@/server/repositories/heroRepository";

export async function POST(request: Request) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid payload: orders must be an array" }, { status: 400 });
    }

    const formattedOrders: { id: number; display_order: number }[] = [];
    for (const item of orders) {
      const id = parseInt(String(item.id), 10);
      const display_order = parseInt(String(item.display_order), 10);
      if (!isNaN(id) && !isNaN(display_order)) {
        formattedOrders.push({ id, display_order });
      }
    }

    if (formattedOrders.length === 0) {
      return NextResponse.json({ error: "No valid order items provided" }, { status: 400 });
    }

    await reorderHeroSlides(formattedOrders);

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/homepage/hero");
    } catch {
      // Ignore cache revalidation errors if static/test
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/hero/reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder hero slides" }, { status: 500 });
  }
}
