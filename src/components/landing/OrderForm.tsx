import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { createOrder } from "@/lib/orders.functions";
import { orderInputSchema } from "@/lib/orders.schema";
import { AREA_LABEL, PRODUCT, type DeliveryArea } from "@/lib/product";

type Tracking = Record<string, string>;

const TRACK_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
];

export function OrderForm() {
  const submitOrder = useServerFn(createOrder);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState<DeliveryArea>("inside_dhaka");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const [tracking, setTracking] = useState<Tracking>({});
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Tracking = {};
    for (const key of TRACK_KEYS) {
      const value = params.get(key);
      if (value) next[key] = value.slice(0, 500);
    }
    setTracking(next);
    setPageUrl(window.location.href.slice(0, 1000));
  }, []);

  const deliveryCharge = PRODUCT.delivery[area];
  const total = PRODUCT.price * qty + deliveryCharge;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError("");

    const payload = {
      customer_name: name,
      phone: phone.replace(/\s|-/g, ""),
      address,
      delivery_area: area,
      quantity: qty,
      note,
      page_url: pageUrl,
      ...tracking,
    };

    const parsed = orderInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const result = await submitOrder({ data: parsed.data });
      if (!result.ok) {
        setServerError(result.message);
        setStatus("idle");
        return;
      }
      setStatus("done");

      const lines = [
        `অর্ডার: ${PRODUCT.title}`,
        `নাম: ${parsed.data.customer_name}`,
        `মোবাইল: ${parsed.data.phone}`,
        `ঠিকানা: ${parsed.data.address}`,
        `এলাকা: ${AREA_LABEL[parsed.data.delivery_area]}`,
        `পরিমাণ: ${parsed.data.quantity} প্যাকেট`,
        `ডেলিভারি চার্জ: ৳${deliveryCharge}`,
        `সর্বমোট: ৳${total}`,
      ];
      const url = `https://wa.me/${PRODUCT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      setServerError("কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন অথবা কল করুন।");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border-2 border-success bg-surface p-8 text-center">
        <h3 className="text-2xl font-bold text-success">ধন্যবাদ! আপনার অর্ডার জমা হয়েছে</h3>
        <p className="mt-3 text-base text-muted-foreground">
          আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন। প্যাকেজিং সম্পূর্ণ গোপন থাকবে।
        </p>
        <a
          href={`tel:+88${PRODUCT.phone}`}
          className="mt-5 inline-flex rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          {PRODUCT.phoneDisplay}
        </a>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block font-semibold">
            আপনার নাম <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className={inputClass}
            placeholder="নাম লিখুন"
          />
          {errors["customer_name"] && (
            <p className="mt-1 text-sm text-primary">{errors["customer_name"]}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block font-semibold">
            মোবাইল নম্বর <span className="text-primary">*</span>
          </label>
          <input
            id="phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={14}
            className={inputClass}
            placeholder="01XXXXXXXXX"
          />
          {errors["phone"] && <p className="mt-1 text-sm text-primary">{errors["phone"]}</p>}
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block font-semibold">
            সম্পূর্ণ ঠিকানা <span className="text-primary">*</span>
          </label>
          <textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            className={inputClass}
            placeholder="বাসা/গ্রাম, রোড, থানা, জেলা"
          />
          {errors["address"] && <p className="mt-1 text-sm text-primary">{errors["address"]}</p>}
        </div>

        <div>
          <span className="mb-1 block font-semibold">ডেলিভারি এলাকা</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(AREA_LABEL) as DeliveryArea[]).map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 ${
                  area === key ? "border-primary bg-surface font-semibold" : "border-input"
                }`}
              >
                <input
                  type="radio"
                  name="area"
                  value={key}
                  checked={area === key}
                  onChange={() => setArea(key)}
                  className="accent-primary"
                />
                {AREA_LABEL[key]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block font-semibold">পরিমাণ (প্যাকেট)</span>
          <div className="inline-flex items-center rounded-md border border-input">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-xl font-bold"
              aria-label="কমান"
            >
              −
            </button>
            <span className="w-12 text-center text-lg font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(50, q + 1))}
              className="px-4 py-2 text-xl font-bold"
              aria-label="বাড়ান"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="note" className="mb-1 block font-semibold">
            মন্তব্য (ঐচ্ছিক)
          </label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            className={inputClass}
            placeholder="কিছু বলতে চাইলে লিখুন"
          />
        </div>

        <div className="rounded-md bg-surface p-4 text-base">
          <div className="flex justify-between">
            <span>পণ্যের দাম ({qty} × ৳{PRODUCT.price})</span>
            <span>৳{PRODUCT.price * qty}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>ডেলিভারি চার্জ</span>
            <span>৳{deliveryCharge}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold text-price">
            <span>সর্বমোট</span>
            <span>৳{total}</span>
          </div>
        </div>

        {serverError && (
          <p className="rounded-md bg-primary/10 p-3 text-sm font-semibold text-primary">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-md bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-md disabled:opacity-60"
        >
          {status === "sending" ? "পাঠানো হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিবেন
        </p>
      </div>
    </form>
  );
}