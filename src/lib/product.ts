export const PRODUCT = {
  title: "১ প্যাকেটে ১০ পিস টিস্যু থাকবে",
  brand: "ম্যাজিক টিস্যু",
  price: 590,
  oldPrice: 1100,
  discount: 46,
  phone: "01631025079",
  phoneDisplay: "01631 025 079",
  whatsapp: "8801631025079",
  /** Facebook Messenger direct chat URL */
  messengerUrl: "https://www.facebook.com/messages/t/velvetouchbd/",
  delivery: { inside_dhaka: 60, outside_dhaka: 120 },
} as const;

export type DeliveryArea = keyof typeof PRODUCT.delivery;

/** ২ পিস বা তার বেশি অর্ডারে সারা বাংলাদেশে ডেলিভারি চার্জ ফ্রি */
export const FREE_DELIVERY_MIN_QTY = 2;

export function getDeliveryCharge(area: DeliveryArea, quantity: number): number {
  if (quantity >= FREE_DELIVERY_MIN_QTY) return 0;
  return PRODUCT.delivery[area];
}

export const AREA_LABEL: Record<DeliveryArea, string> = {
  inside_dhaka: "ঢাকা সিটির ভেতরে (৳৬০)",
  outside_dhaka: "ঢাকার বাহিরে (৳১২০)",
};

export const IMAGES = {
  hero: "https://rexbangla.com/image/cache/catalog/Content/Magic-Tissue-550x550.jpg",
  d1: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-1.jpeg",
  d2: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-2.jpeg",
  d3: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-3.jpeg",
  d4: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-4.jpeg",
  d5: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-5.jpeg",
  d6: "https://careforbd.com/image/catalog/Products/Magic-Tissue/Magic-Tissue-6.jpeg",
  extra1:
    "https://rexbangla.com/image/catalog/Content/WhatsApp%20Image%202025-12-22%20at%2012.53.10%20AM.jpeg",
  extra2:
    "https://rexbangla.com/image/catalog/Content/WhatsApp%20Image%202025-12-22%20at%2012.53.10%20AM%20(2).jpeg",
} as const;

export const BENEFITS = [
  "সহবাসে ৩০-৪০ মিনিট পর্যন্ত দীর্ঘস্থায়িত্ব",
  "ভিটামিন E সমৃদ্ধ – কোনো ক্ষতি ছাড়াই কাজ করে",
  "জার্মান ল্যাব টেস্টেড – পার্শপ্রতিক্রিয়ামুক্ত",
  "ডায়াবেটিস ও হার্টের রোগীরাও ব্যবহার করতে পারবেন",
  "দ্রুত কাজ করে, সহজে ব্যবহারযোগ্য",
];

export const EFFECTS = [
  "ম্যাজিক টিস্যু ব্যবহারে ৩০–৪০ মিনিট সহবাস করা যায়",
  "মেলাশেষায় পরিপূর্ণ তৃপ্তি পাওয়া যায়",
  "লিঙ্গ শক্ত ও টাইট রাখতে সাহায্য করে",
  "ডায়াবেটিস ও হার্টের রোগীরা ও ব্যবহার করতে পারবেন",
  "এটির সবচেয়ে বড় গুণ হল এটি খুব দ্রুত কাজ করে",
];

export const USAGE = [
  "প্রতিবার সহবাসে যাওয়ার ২-৩ মিনিট আগে লিঙ্গ ধুয়ে শুকনো কাপড় অথবা টিস্যু দিয়ে মুছে নেবেন।",
  "লিঙ্গের আগা থেকে অর্ধেক পর্যন্ত ২-৩ বার মুছবেন টিস্যু-টি দিয়ে এবং চারপাশে ভালো করে একটি আঙ্গুল দিয়ে মালিশ করে দিবেন — এটা সর্বোচ্চ ৩০ সেকেন্ডের মধ্যে একেবারে শুকিয়ে যাবে।",
  "২ মিনিট অপেক্ষা করবেন।",
  "তারপর সহবাসে যাবেন।",
];

export const orderSchemaShape = {
  maxName: 100,
  maxAddress: 500,
};