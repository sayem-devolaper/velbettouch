import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdsSettings, saveAdsSettings } from "@/lib/ads.functions";
import { adsSettingsSchema, type AdsSettingsInput } from "@/lib/ads.schema";

export const Route = createFileRoute("/_authenticated/ads")({
  head: () => ({
    meta: [
      { title: "ফেসবুক অ্যাডস সেটআপ | ম্যাজিক টিস্যু" },
      {
        name: "description",
        content: "পিক্সেল আইডি, কনভার্শন এপিআই টোকেন ও টেস্ট ইভেন্ট কোড বসিয়ে অ্যাডস ট্র্যাকিং চালু করুন।",
      },
      { property: "og:title", content: "ফেসবুক অ্যাডস সেটআপ" },
      { property: "og:description", content: "পিক্সেল ও কনভার্শন এপিআই কনফিগারেশন প্যানেল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdsSettingsPage,
});

const EMPTY: AdsSettingsInput = {
  fb_pixel_id: "",
  fb_capi_access_token: "",
  fb_test_event_code: "",
  fb_domain_verification: "",
  pixel_enabled: true,
  capi_enabled: false,
  currency: "BDT",
};

function AdsSettingsPage() {
  const load = useServerFn(getAdsSettings);
  const save = useServerFn(saveAdsSettings);
  const [form, setForm] = useState<AdsSettingsInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const settingsQuery = useQuery({
    queryKey: ["ads-settings"],
    queryFn: () => load({ data: undefined }),
    retry: 2,
    retryDelay: 800,
  });


  useEffect(() => {
    const data = settingsQuery.data;
    if (!data) return;
    setForm({
      fb_pixel_id: data.fb_pixel_id ?? "",
      fb_capi_access_token: data.fb_capi_access_token ?? "",
      fb_test_event_code: data.fb_test_event_code ?? "",
      fb_domain_verification: data.fb_domain_verification ?? "",
      pixel_enabled: data.pixel_enabled,
      capi_enabled: data.capi_enabled,
      currency: data.currency ?? "BDT",
    });
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: AdsSettingsInput) => save({ data: values }),
    onSuccess: () => toast.success("সেটিংস সেভ হয়েছে"),
    onError: (error: Error) => toast.error(error.message || "সেভ করা যায়নি"),
  });

  const set = <K extends keyof AdsSettingsInput>(key: K, value: AdsSettingsInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = adsSettingsSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    saveMutation.mutate(parsed.data);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ফেসবুক অ্যাডস সেটআপ</h1>
        <Link to="/dashboard" className="text-sm font-semibold text-primary underline">
          অর্ডার ড্যাশবোর্ড
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        এখানে যা বসাবেন তা সাথে সাথে ল্যান্ডিং পেজে কাজ করবে — কোড এডিট করার দরকার নেই।
      </p>

      {settingsQuery.isLoading ? (
        <p className="mt-8 text-muted-foreground">লোড হচ্ছে...</p>
      ) : settingsQuery.isError ? (
        <div className="mt-8 space-y-3">
          <p className="text-primary">
            {settingsQuery.error instanceof Error
              ? settingsQuery.error.message
              : "সেটিংস লোড হয়নি। আবার লগইন করে চেষ্টা করুন।"}
          </p>
          <Button type="button" variant="outline" onClick={() => void settingsQuery.refetch()}>
            আবার চেষ্টা করুন
          </Button>
        </div>

      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-bold">পিক্সেল</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="pixel">ফেসবুক পিক্সেল আইডি (Dataset ID)</Label>
                <Input
                  id="pixel"
                  inputMode="numeric"
                  value={form.fb_pixel_id}
                  onChange={(e) => set("fb_pixel_id", e.target.value)}
                  placeholder="1234567890123456"
                />
                {errors["fb_pixel_id"] && (
                  <p className="mt-1 text-sm text-primary">{errors["fb_pixel_id"]}</p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.pixel_enabled}
                  onChange={(e) => set("pixel_enabled", e.target.checked)}
                  className="accent-primary"
                />
                ব্রাউজার পিক্সেল চালু (PageView + Purchase)
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-bold">কনভার্শন এপিআই (Conversions API)</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="token">এক্সেস টোকেন</Label>
                <Textarea
                  id="token"
                  rows={3}
                  value={form.fb_capi_access_token}
                  onChange={(e) => set("fb_capi_access_token", e.target.value)}
                  placeholder="EAAG..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Events Manager → Settings → Conversions API → Generate access token।
                </p>
              </div>
              <div>
                <Label htmlFor="test">টেস্ট ইভেন্ট কোড (ঐচ্ছিক)</Label>
                <Input
                  id="test"
                  value={form.fb_test_event_code}
                  onChange={(e) => set("fb_test_event_code", e.target.value)}
                  placeholder="TEST12345"
                />
              </div>
              <div>
                <Label htmlFor="currency">কারেন্সি</Label>
                <Input
                  id="currency"
                  maxLength={3}
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value.toUpperCase())}
                  placeholder="BDT"
                />
                {errors["currency"] && (
                  <p className="mt-1 text-sm text-primary">{errors["currency"]}</p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.capi_enabled}
                  onChange={(e) => set("capi_enabled", e.target.checked)}
                  className="accent-primary"
                />
                সার্ভার সাইড Purchase ইভেন্ট পাঠানো চালু
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-bold">ডোমেইন ভেরিফিকেশন</h2>
            <div className="mt-4">
              <Label htmlFor="domain">facebook-domain-verification কোড</Label>
              <Input
                id="domain"
                value={form.fb_domain_verification}
                onChange={(e) => set("fb_domain_verification", e.target.value)}
                placeholder="abc123xyz..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Business Settings → Brand Safety → Domains থেকে মেটা ট্যাগের কোডটুকু বসান।
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 text-sm">
            <h2 className="text-lg font-bold">অ্যাডসে যেসব লিংক লাগবে</h2>
            <ul className="mt-3 space-y-2">
              <li>
                ল্যান্ডিং পেজ (অ্যাড ডেস্টিনেশন): <span className="font-mono">{origin}/</span>
              </li>
              <li>
                Purchase কনভার্শন পেজ (thank you):{" "}
                <span className="font-mono">{origin}/thank-you</span>
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              অর্ডার সাবমিট হলে ক্রেতা অটোমেটিক thank-you পেজে যায় এবং সেখানেই Purchase ইভেন্ট
              (ব্রাউজার + সার্ভার, একই event ID দিয়ে ডুপ্লিকেট ছাড়া) ফায়ার হয়।
            </p>
          </section>

          <Button type="submit" disabled={saveMutation.isPending} className="w-full py-6 text-base">
            {saveMutation.isPending ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
          </Button>
        </form>
      )}
    </main>
  );
}
