export function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-base leading-relaxed">
      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-primary-foreground">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}