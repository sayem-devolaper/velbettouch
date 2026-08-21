import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adsSettingsSchema, trackPurchaseSchema } from "./ads.schema";

/** Public: only the values that are safe to render in the browser. */
export const getPublicAdsSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("ads_settings")
    .select("fb_pixel_id, pixel_enabled, fb_domain_verification, currency")
    .eq("id", "default")
    .maybeSingle();

  return {
    pixelId: data?.pixel_enabled && data?.fb_pixel_id ? data.fb_pixel_id : null,
    domainVerification: data?.fb_domain_verification ?? null,
    currency: data?.currency ?? "BDT",
  };
});

export const getAdsSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("ads_settings")
      .select(
        "fb_pixel_id, fb_capi_access_token, fb_test_event_code, fb_domain_verification, pixel_enabled, capi_enabled, currency",
      )
      .eq("id", "default")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveAdsSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adsSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("ads_settings")
      .update({
        fb_pixel_id: data.fb_pixel_id || null,
        fb_capi_access_token: data.fb_capi_access_token || null,
        fb_test_event_code: data.fb_test_event_code || null,
        fb_domain_verification: data.fb_domain_verification || null,
        pixel_enabled: data.pixel_enabled,
        capi_enabled: data.capi_enabled,
        currency: data.currency.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * Called from the thank-you page. Reports the Purchase server-side with the same
 * event_id the browser pixel uses, so Facebook de-duplicates the two.
 */
export const trackPurchase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => trackPurchaseSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendPurchaseToCapi } = await import("./ads.server");
    const { PRODUCT } = await import("./product");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, phone, quantity, total, purchase_tracked, delivery_area")
      .eq("id", data.order_id)
      .maybeSingle();
    if (!order) return { ok: false as const, reason: "order_not_found" };

    const { data: settings } = await supabaseAdmin
      .from("ads_settings")
      .select(
        "fb_pixel_id, fb_capi_access_token, fb_test_event_code, fb_domain_verification, pixel_enabled, capi_enabled, currency",
      )
      .eq("id", "default")
      .maybeSingle();

    const payload = {
      value: Number(order.total),
      quantity: order.quantity,
      currency: settings?.currency ?? "BDT",
      eventId: order.id,
    };

    if (order.purchase_tracked || !settings) return { ok: true as const, ...payload, capi: false };

    const result = await sendPurchaseToCapi({
      settings,
      eventId: order.id,
      eventSourceUrl: data.event_source_url ?? "",
      value: payload.value,
      quantity: order.quantity,
      contentName: PRODUCT.title,
      customer: {
        name: order.customer_name,
        phone: order.phone,
        city: order.delivery_area === "inside_dhaka" ? "dhaka" : null,
      },
      userAgent: data.user_agent ?? null,
      fbp: data.fbp ?? null,
      fbc: data.fbc ?? null,
    });

    if (result.sent) {
      await supabaseAdmin.from("orders").update({ purchase_tracked: true }).eq("id", order.id);
    }

    return { ok: true as const, ...payload, capi: result.sent };
  });
