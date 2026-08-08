import { PRODUCT } from "@/lib/product";

export function StickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
      <a
        href={`tel:+88${PRODUCT.phone}`}
        className="flex flex-1 items-center justify-center gap-2 py-4 text-base font-bold text-success"
      >
        কল করুন
      </a>
      <a
        href="#order"
        className="flex flex-1 items-center justify-center bg-primary py-4 text-base font-bold text-primary-foreground"
      >
        অর্ডার করুন
      </a>
    </div>
  );
}