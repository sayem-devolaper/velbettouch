import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { orderInputSchema } from "./orders.schema";
import { PRODUCT, getDeliveryCharge } from "./product";

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderInputSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const deliveryCharge = getDeliveryCharge(data.delivery_area, data.quantity);
    const total = PRODUCT.price * data.quantity + deliveryCharge;
    const orderId = crypto.randomUUID();

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: data.customer_name,
      phone: data.phone,
      address: data.address,
      delivery_area: data.delivery_area,
      quantity: data.quantity,
      unit_price: PRODUCT.price,
      delivery_charge: deliveryCharge,
      total,
      note: data.note || null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_content: data.utm_content ?? null,
      utm_term: data.utm_term ?? null,
      utm_id: data.utm_id ?? null,
      fbclid: data.fbclid ?? null,
      page_url: data.page_url ?? null,
    });

    if (error) {
      console.error("order insert failed", error.message);
      return { ok: false as const, message: "অর্ডার জমা হয়নি, আবার চেষ্টা করুন।" };
    }

    return { ok: true as const, total, deliveryCharge, orderId };
  });