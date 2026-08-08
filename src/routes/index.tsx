import { createFileRoute } from "@tanstack/react-router";

import { Check } from "@/components/landing/Check";
import { CtaButton } from "@/components/landing/CtaButton";
import { OrderForm } from "@/components/landing/OrderForm";
import { StickyBar } from "@/components/landing/StickyBar";
import { BENEFITS, EFFECTS, IMAGES, PRODUCT, USAGE } from "@/lib/product";

const TITLE = "ম্যাজিক টিস্যু — ১ প্যাকেটে ১০ পিস | ৳৬৯০";
const DESCRIPTION =
  "ম্যাজিক টিস্যু: মাত্র ২ মিনিটে আত্মবিশ্বাস। ১ প্যাকেটে ১০ পিস, দাম ৳৬৯০। ক্যাশ অন ডেলিভারি, গোপন প্যাকেজিং, সারা বাংলাদেশে ডেলিভারি।";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:image", content: IMAGES.hero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMAGES.hero },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-bold text-primary">{PRODUCT.brand}</span>
          <div className="flex items-center gap-2">
            <a
              href={`tel:+88${PRODUCT.phone}`}
              className="rounded-md border border-success px-3 py-2 text-sm font-bold text-success"
            >
              {PRODUCT.phoneDisplay}
            </a>
            <a
              href="#order"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
            >
              অর্ডার করুন
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        <section className="pt-6 text-center">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4">
            <div className="absolute left-4 top-4 flex flex-col gap-1">
              <span className="rounded bg-warning px-2 py-1 text-xs font-bold text-foreground">
                Hot
              </span>
              <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                -{PRODUCT.discount}%
              </span>
            </div>
            <img
              src={IMAGES.hero}
              alt={`${PRODUCT.brand} — ${PRODUCT.title}`}
              width={550}
              height={550}
              className="mx-auto h-auto w-full max-w-sm rounded"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-snug">{PRODUCT.title}</h1>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-4xl font-bold text-price">৳{PRODUCT.price}</span>
            <span className="text-xl text-muted-foreground line-through">৳{PRODUCT.oldPrice}</span>
          </div>
          <p className="mt-1 text-base text-muted-foreground">
            পকেট সাইজ | গোপন প্যাকেজিং | সম্পূর্ণ নিরাপদ
          </p>

          <div className="mt-5">
            <CtaButton>অর্ডার করুন — ৳{PRODUCT.price}</CtaButton>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-base">
              <tbody>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium">ঢাকা সিটির ভেতরে ডেলিভারি চার্জ</th>
                  <td className="px-4 py-3 font-bold">৳ {PRODUCT.delivery.inside_dhaka} টাকা</td>
                </tr>
                <tr>
                  <th className="px-4 py-3 font-medium">ঢাকার বাহিরে ডেলিভারি চার্জ</th>
                  <td className="px-4 py-3 font-bold">৳ {PRODUCT.delivery.outside_dhaka} টাকা</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">পণ্যের বিবরণ</h2>
          <img
            src={IMAGES.d1}
            alt="ম্যাজিক টিস্যু প্যাকেট"
            className="mt-4 h-auto w-full rounded-lg border border-border"
            loading="lazy"
          />
          <h3 className="mt-6 text-xl font-bold text-primary">
            ম্যাজিক টিস্যু – মাত্র ২ মিনিটে আত্মবিশ্বাস ফিরে পান!
          </h3>
          <ul className="mt-4 space-y-3">
            {BENEFITS.map((item) => (
              <Check key={item}>{item}</Check>
            ))}
          </ul>
          <p className="mt-4 rounded-md bg-surface px-4 py-3 text-center font-semibold">
            পকেট সাইজ | গোপন প্যাকেজিং | সম্পূর্ণ নিরাপদ
          </p>
          <div className="mt-5 grid gap-4">
            <img
              src={IMAGES.d2}
              alt="ম্যাজিক টিস্যু ব্যবহারের সুবিধা"
              className="h-auto w-full rounded-lg border border-border"
              loading="lazy"
            />
            <img
              src={IMAGES.d3}
              alt="ম্যাজিক টিস্যুর উপকারিতা"
              className="h-auto w-full rounded-lg border border-border"
              loading="lazy"
            />
            <img
              src={IMAGES.d4}
              alt="ম্যাজিক টিস্যু পণ্যের ছবি"
              className="h-auto w-full rounded-lg border border-border"
              loading="lazy"
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">কিভাবে ব্যবহার করব?</h2>
          <ol className="mt-4 space-y-3">
            {USAGE.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-lg border border-border bg-card p-4 text-base leading-relaxed"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">কার্যকারিতা গুলো কী কী?</h2>
          <ul className="mt-4 space-y-3">
            {EFFECTS.map((item) => (
              <Check key={item}>{item}</Check>
            ))}
          </ul>
          <img
            src={IMAGES.extra1}
            alt="ম্যাজিক টিস্যু ফলাফল"
            className="mt-5 h-auto w-full rounded-lg border border-border"
            loading="lazy"
          />
          <div className="mt-5 text-center">
            <CtaButton />
          </div>
        </section>

        <section className="mt-10 text-center">
          <img
            src={IMAGES.d5}
            alt="ম্যাজিক টিস্যু প্যাকেজিং"
            className="h-auto w-full rounded-lg border border-border"
            loading="lazy"
          />
          <img
            src={IMAGES.extra2}
            alt="ম্যাজিক টিস্যু গ্রাহক তথ্য"
            className="mt-4 h-auto w-full rounded-lg border border-border"
            loading="lazy"
          />
          <div className="mt-5">
            <CtaButton />
          </div>
          <img
            src={IMAGES.d6}
            alt="ম্যাজিক টিস্যু বিস্তারিত"
            className="mt-6 h-auto w-full rounded-lg border border-border"
            loading="lazy"
          />
        </section>

        <section id="order" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold">এখনি অর্ডার করুন</h2>
          <p className="mt-1 text-base text-muted-foreground">
            নিচের ফর্মটি পূরণ করুন — আমরা কল দিয়ে অর্ডার কনফার্ম করবো।
          </p>
          <div className="mt-4">
            <OrderForm />
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-border bg-surface py-8 text-center">
        <p className="text-base font-semibold">অর্ডার বা যেকোনো প্রশ্নে কল করুন</p>
        <a
          href={`tel:+88${PRODUCT.phone}`}
          className="mt-2 inline-block text-2xl font-bold text-primary"
        >
          {PRODUCT.phoneDisplay}
        </a>
        <p className="mt-3 text-sm text-muted-foreground">
          সারা বাংলাদেশে হোম ডেলিভারি | ১০০% গোপন প্যাকেজিং
        </p>
      </footer>

      <StickyBar />
    </div>
  );
}
