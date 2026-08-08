# Magic Tissue — Bangla Landing Page (rexbangla clone)

A single-page Bangla direct-response landing page that mirrors the reference page's content and flow, with a working order form that saves orders to the backend and also opens a WhatsApp confirmation message.

## Page structure (top to bottom, at `/`)

1. Sticky top bar: brand + call button `01752 955 648` (tel link) + "অর্ডার করুন" scroll button.
2. Hero: product image, title "১ প্যাকেটে ১০ পিস টিস্যু থাকবে", `-37%` / `Hot` badges, price `690 TAKA` with `1,100 TAKA` struck through, qty selector, primary CTA.
3. Delivery charge table: ঢাকা সিটির ভেতরে ৳60, ঢাকার বাহিরে ৳120.
4. পণ্যের বিবরণ: the 5 checkmark benefits + "পকেট সাইজ | গোপন প্যাকেজিং | সম্পূর্ণ নিরাপদ", with the reference product images.
5. কিভাবে ব্যবহার করব: the usage steps as numbered cards.
6. কার্যকারিতা গুলো কী কী: the 5 effectiveness points.
7. Repeated image + "এখনি অর্ডার করুণ" CTA blocks, same as the reference rhythm.
8. Order form section (`#order`): নাম, মোবাইল নম্বর, সম্পূর্ণ ঠিকানা, ডেলিভারি এলাকা (ভিতরে/বাইরে), quantity — live total = 690 × qty + delivery charge.
9. Footer: phone, minimal note.
10. Mobile-first sticky bottom bar (call + order) since traffic is Facebook paid/mobile.

## Order handling

- Lovable Cloud backend enabled; an `orders` table stores name, phone, address, delivery area, quantity, delivery charge, total, status, and UTM/fbclid params captured from the URL.
- Public insert only (no public reads), with grants + RLS so visitors can submit but cannot read others' orders.
- Submit flow: validate with zod (Bangla error messages, BD phone pattern) → insert via a server function → show a Bangla thank-you state → open a prefilled WhatsApp message to `01752955648` with the order details.
- Simple admin-free approach: orders are viewable in the backend table. If you later want an in-app order list, that needs login and can be added.

## Design

- Direct-response Bangla commerce look matching the reference: white background, red/green accent CTAs, big bold Bangla headings, checkmark lists, boxed price block, rounded cards, heavy CTA repetition.
- Bangla webfont (Hind Siliguri / Noto Sans Bengali) loaded via a link tag in the root head.
- Colors/spacing added as semantic design tokens in `src/styles.css` (no hardcoded color utilities).

## Technical notes

- Route: rewrite `src/routes/index.tsx` as the landing page, split into components under `src/components/landing/`.
- Images hotlinked from the reference URLs (rexbangla.com / careforbd.com) as requested; if any of those hosts go down the images will break — swap to uploaded files later if that happens.
- Order insert via `createServerFn` in `src/lib/orders.functions.ts`, zod-validated server-side too; WhatsApp URL built with `encodeURIComponent`.
- SEO: unique Bangla title/description, og/twitter tags with the product image as absolute og:image, single H1, semantic sections, alt text.
- UTM params read from `window.location.search` after hydration and stored with the order.
