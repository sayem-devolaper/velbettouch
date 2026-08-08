import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public lookup: returns only non-sensitive order status fields, never address or name.
export const trackOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন") })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("id, quantity, total, delivery_area, status, created_at")
      .eq("phone", data.phone)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("track lookup failed", error.message);
      return { ok: false as const, orders: [] };
    }

    return {
      ok: true as const,
      orders: (rows ?? []).map((o) => ({
        code: o.id.slice(0, 8).toUpperCase(),
        quantity: o.quantity,
        total: o.total,
        delivery_area: o.delivery_area,
        status: o.status,
        created_at: o.created_at,
      })),
    };
  });