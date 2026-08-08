import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
  address: z.string().trim().min(5).max(500),
  delivery_area: z.enum(["inside_dhaka", "outside_dhaka"]),
  quantity: z.number().int().min(1).max(50),
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin only");
}

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { PRODUCT } = await import("./product");
    const deliveryCharge = PRODUCT.delivery[data.delivery_area];
    const total = PRODUCT.price * data.quantity + deliveryCharge;
    const { error } = await context.supabase
      .from("orders")
      .update({
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address,
        delivery_area: data.delivery_area,
        quantity: data.quantity,
        status: data.status,
        note: data.note || null,
        unit_price: PRODUCT.price,
        delivery_charge: deliveryCharge,
        total,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, total };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const isAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: Boolean(data) };
  });

// First signed-in user of a fresh store becomes the admin. Once an admin
// exists, this never grants anything again.
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) > 0) return { granted: false as const };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { granted: false as const };
    return { granted: true as const };
  });