export function CtaButton({
  children = "এখনি অর্ডার করুন",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#order"
      className={`inline-flex w-full max-w-sm items-center justify-center rounded-md bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99] ${className}`}
    >
      {children}
    </a>
  );
}