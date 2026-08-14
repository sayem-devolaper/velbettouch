import { z } from "zod";

export const adsSettingsSchema = z.object({
  fb_pixel_id: z
    .string()
    .trim()
    .regex(/^\d{10,20}$/, { message: "পিক্সেল আইডি শুধু সংখ্যা হবে (১০-২০ ডিজিট)" })
    .or(z.literal("")),
  fb_capi_access_token: z.string().trim().max(1000).or(z.literal("")),
  fb_test_event_code: z.string().trim().max(50).or(z.literal("")),
  fb_domain_verification: z.string().trim().max(200).or(z.literal("")),
  pixel_enabled: z.boolean(),
  capi_enabled: z.boolean(),
  currency: z.string().trim().length(3),
});

export type AdsSettingsInput = z.infer<typeof adsSettingsSchema>;

export const trackPurchaseSchema = z.object({
  order_id: z.string().uuid(),
  event_source_url: z.string().max(1000).optional(),
  user_agent: z.string().max(500).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(500).optional(),
});
