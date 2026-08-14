import { PRODUCT } from "@/lib/product";

export function FloatingContact() {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 md:bottom-6">
      <a
        href={PRODUCT.messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="মেসেঞ্জারে চ্যাট করুন"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#0084FF] shadow-lg transition hover:scale-105"
        style={{ height: 52, width: 52 }}
      >
        <svg viewBox="0 0 24 24" fill="#fff" className="h-7 w-7" aria-hidden="true">
          <path d="M12 2C6.3 2 2 6.2 2 11.5c0 2.9 1.3 5.4 3.5 7.1V22l3.2-1.8c.9.2 1.8.4 2.8.4 5.7 0 10-4.2 10-9.5S17.7 2 12 2zm1 12.2-2.6-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.3 5.7z" />
        </svg>
      </a>
      <a
        href={`https://wa.me/${PRODUCT.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="হোয়াটসঅ্যাপে চ্যাট করুন"
        className="flex items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105"
        style={{ height: 52, width: 52 }}
      >
        <svg viewBox="0 0 24 24" fill="#fff" className="h-7 w-7" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.1c-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.4-.5.6-.7.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.6-1.6-.9-2.2c-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.4 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.2-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.1L2 22l5-1.5c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.5-4.4-1.3l-.3-.2-3 .9.9-2.9-.2-.3C4.3 15 3.8 13.6 3.8 12 3.8 7.5 7.5 3.8 12 3.8s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z" />
        </svg>
      </a>
    </div>
  );
}