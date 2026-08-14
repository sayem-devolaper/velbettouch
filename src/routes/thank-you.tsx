import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { getFbCookies } from "@/components/tracking/MetaPixel";
import { trackPurchase } from "@/lib/ads.functions";
import { PRODUCT } from "@/lib/product";

export const Route = createFileRoute("/thank-you")({
  validateSearch: z.object({ order: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "ধন্যবাদ — আপনার অর্ডার কনফার্ম হয়েছে | ম্যাজিক টিস্যু" },
      {
        name: "description",
        content:
          "আপনার অর্ডার সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি খুব শীঘ্রই ফোনে কনফার্ম করবেন। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা দিবেন।",
      },
      { property: "og:title", content: "ধন্যবাদ — অর্ডার কনফার্ম হয়েছে" },
      { property: "og:description", content: "আপনার অর্ডার জমা হয়েছে, শীঘ্রই কল করা হবে।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { order } = Route.useSearch();
  const report = useServerFn(trackPurchase);
  const fired = useRef(false);
  const [summary, setSummary] = useState<{ value: number; quantity: number } | null>(null);

  useEffect(() => {
    if (!order || fired.current) return;
    fired.current = true;

    const { fbp, fbc } = getFbCookies();
    report({
      data: {
        order_id: order,
        event_source_url: window.location.href.slice(0, 1000),
        user_agent: navigator.userAgent.slice(0, 500),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
      },
    })
      .then((result) => {
        if (!result.ok || !("value" in result)) return;
        setSummary({ value: result.value, quantity: result.quantity });

        const fbq = (window as any).fbq;
        if (typeof fbq === "function") {
          fbq(
            "track",
            "Purchase",
            {
              value: result.value,
              currency: result.currency,
              contents: [{ id: "magic-tissue", quantity: result.quantity }],
              content_type: "product",
              content_name: PRODUCT.title,
              num_items: result.quantity,
            },
            { eventID: order },
          );
        }
      })
      .catch((error) => console.error(error));
  }, [order, report]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border-2 border-success bg-card p-8 text-center shadow-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-3xl font-bold text-primary-foreground">
          ✓
        </div>
        <h1 className="mt-5 text-3xl font-bold text-success">ধন্যবাদ! আপনার অর্ডার কনফার্ম হয়েছে</h1>
        <p className="mt-3 text-base text-muted-foreground">
          আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন। প্যাকেজিং সম্পূর্ণ গোপন থাকবে
          এবং পণ্য হাতে পেয়ে টাকা দিবেন।
        </p>

        {summary && (
          <div className="mt-6 rounded-lg bg-surface p-4 text-left text-base">
            <div className="flex justify-between">
              <span>পরিমাণ</span>
              <span className="font-semibold">{summary.quantity} প্যাকেট</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold text-price">
              <span>সর্বমোট</span>
              <span>৳{summary.value}</span>
            </div>
          </div>
        )}

        {order && (
          <p className="mt-4 text-sm text-muted-foreground">
            অর্ডার আইডি: <span className="font-mono">{order.slice(0, 8)}</span>
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3">
          <a
            href={`tel:+88${PRODUCT.phone}`}
            className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            যেকোনো প্রশ্নে কল করুন: {PRODUCT.phoneDisplay}
          </a>
          <a
            href={`https://wa.me/${PRODUCT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-success px-6 py-3 font-bold text-primary-foreground"
          >
            হোয়াটসঅ্যাপে মেসেজ করুন
          </a>
          <div className="flex justify-center gap-4 text-sm font-semibold">
            <Link to="/track" className="text-primary underline">
              অর্ডার ট্র্যাক করুন
            </Link>
            <Link to="/" className="text-muted-foreground underline">
              হোমে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
