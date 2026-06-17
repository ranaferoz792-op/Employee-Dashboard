type BrandLogoProps = {
  size?: "sm" | "md";
};

export default function BrandLogo({ size = "md" }: BrandLogoProps) {
  const sizeClass = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/30 ${sizeClass}`}
      aria-label="Temporary company logo"
    >
      NS
    </div>
  );
}
