import { createHash } from "crypto";

export type AdsSettingsRow = {
  fb_pixel_id: string | null;
  fb_capi_access_token: string | null;
  fb_test_event_code: string | null;
  fb_domain_verification: string | null;
  pixel_enabled: boolean;
  capi_enabled: boolean;
  currency: string;
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Facebook requires user data to be normalised + SHA-256 hashed. */
export function hashed(value: string | null | undefined) {
  if (!value) return undefined;
  const normalised = value.trim().toLowerCase();
  if (!normalised) return undefined;
  return [sha256(normalised)];
}

export function hashedPhone(phone: string | null | undefined) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  // Bangladeshi local numbers (01XXXXXXXXX) need the 880 country code for CAPI.
  const e164 = digits.startsWith("880") ? digits : `880${digits.replace(/^0/, "")}`;
  return [sha256(e164)];
}

export async function sendPurchaseToCapi(input: {
  settings: AdsSettingsRow;
  eventId: string;
  eventSourceUrl: string;
  value: number;
  quantity: number;
  contentName: string;
  customer: { name: string; phone: string; city?: string | null };
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}) {
  const { settings } = input;
  if (!settings.capi_enabled) return { sent: false as const, reason: "capi_disabled" };
  if (!settings.fb_pixel_id || !settings.fb_capi_access_token) {
    return { sent: false as const, reason: "missing_credentials" };
  }

  const [first, ...rest] = input.customer.name.trim().split(/\s+/);

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: {
          ph: hashedPhone(input.customer.phone),
          fn: hashed(first),
          ln: rest.length ? hashed(rest.join(" ")) : undefined,
          ct: hashed(input.customer.city ?? undefined),
          country: hashed("bd"),
          client_ip_address: input.clientIp ?? undefined,
          client_user_agent: input.userAgent ?? undefined,
          fbp: input.fbp ?? undefined,
          fbc: input.fbc ?? undefined,
        },
        custom_data: {
          currency: settings.currency || "BDT",
          value: input.value,
          num_items: input.quantity,
          content_type: "product",
          content_name: input.contentName,
        },
      },
    ],
    access_token: settings.fb_capi_access_token,
  };
  if (settings.fb_test_event_code) body["test_event_code"] = settings.fb_test_event_code;

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${settings.fb_pixel_id}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    console.error(`Facebook CAPI failed [${response.status}]: ${text}`);
    return { sent: false as const, reason: `capi_error_${response.status}` };
  }
  return { sent: true as const, response: text };
}
