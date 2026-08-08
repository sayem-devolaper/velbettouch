import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AREA_LABEL, PRODUCT, type DeliveryArea } from "@/lib/product";
import { trackOrders } from "@/lib/track.functions";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "আমার অর্ডার দেখুন | ম্যাজিক টিস্যু" },
      {
        name: "description",
        content:
          "মোবাইল নম্বর দিয়ে আপনার ম্যাজিক টিস্যু অর্ডারের অবস্থা দেখুন — কনফার্ম, কুরিয়ারে বা ডেলিভারি হয়েছে।",
      },
      { property: "og:title", content: "আমার অর্ডার দেখুন | ম্যাজিক টিস্যু" },
      {
        property: "og:description",
        content: "মোবাইল নম্বর দিয়ে অর্ডারের সর্বশেষ অবস্থা জানুন।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "নতুন অর্ডার (কনফার্মের অপেক্ষায়)",
  confirmed: "কনফার্ম হয়েছে",
  shipped: "কুরিয়ারে পাঠানো হয়েছে",
  delivered: "ডেলিভারি সম্পন্ন",
  cancelled: "ক্যানসেল করা হয়েছে",
};

function TrackPage() {
  const lookup = useServerFn(trackOrders);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrders>> | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await lookup({ data: { phone: phone.trim() } });
      setResult(res);
    } catch {
      setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">আমার অর্ডার দেখুন</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          অর্ডারের সময় দেওয়া মোবাইল নম্বরটি লিখুন।
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-5 rounded-2xl border border-border bg-background p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="t-phone">মোবাইল নম্বর</Label>
            <Input
              id="t-phone"
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && <p className="mt-2 text-sm text-primary">{error}</p>}
          <Button type="submit" className="mt-4 w-full" disabled={busy}>
            {busy ? "খোঁজা হচ্ছে..." : "অর্ডার খুঁজুন"}
          </Button>
        </form>

        {result && result.orders.length === 0 && (
          <p className="mt-5 text-sm">
            এই নম্বরে কোনো অর্ডার পাওয়া যায়নি। সাহায্যের জন্য কল করুন{" "}
            <a href={`tel:+88${PRODUCT.phone}`} className="font-bold text-primary">
              {PRODUCT.phoneDisplay}
            </a>
            ।
          </p>
        )}

        <div className="mt-5 space-y-3">
          {result?.orders.map((o) => (
            <div key={o.code} className="rounded-xl border border-border bg-background p-4">
              <p className="font-bold">অর্ডার #{o.code}</p>
              <p className="mt-1 text-sm">
                অবস্থা: <strong>{STATUS_LABEL[o.status] ?? o.status}</strong>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                পরিমাণ {o.quantity} · মোট ৳{o.total} ·{" "}
                {AREA_LABEL[o.delivery_area as DeliveryArea] ?? o.delivery_area}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
          ))}
        </div>

        <a href="/" className="mt-6 inline-block text-sm text-muted-foreground underline">
          ← হোমে ফিরে যান
        </a>
      </div>
    </main>
  );
}