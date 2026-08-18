export function OtzMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`label inline-flex items-center justify-center rounded-full border border-primary px-3 py-1 leading-none text-primary ${className}`}
    >
      OTZ
    </span>
  );
}
