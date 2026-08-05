import Image from "next/image";

// BranBoos brand assets — real PNG files exported from the official logo.
// Files live in public/brand/.

type MarkProps = {
  size?: number;
  className?: string;
};

export function BranBoosMark({ size = 40, className }: MarkProps) {
  return (
    <Image
      src="/brand/branboos-icon.png"
      alt="BranBoos"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function BranBoosWordmark({
  showTagline = false,
  className,
}: {
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col leading-tight ${className ?? ""}`}>
      <span className="font-heading text-2xl font-bold tracking-tight text-[#1A1A18]">
        BranBoos
      </span>
      <span className="mt-1 h-[3px] w-14 rounded-full bg-gradient-to-r from-[#F4511E] via-[#FDD835] via-[#8BC34A] to-[#00ACC1]" />
      {showTagline && (
        <span className="mt-1 text-[10px] font-medium tracking-widest text-[#9B9B94] uppercase">
          Technologies Pvt. Ltd.
        </span>
      )}
    </div>
  );
}

export function BranBoosLockup({
  markSize = 40,
  showTagline = false,
  className,
}: {
  markSize?: number;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <BranBoosMark size={markSize} />
      <BranBoosWordmark showTagline={showTagline} />
    </div>
  );
}

// Full black-text logo (icon + BranBoos wordmark + gradient bar + tagline) as
// a single PNG — good for the auth screen where we want the polished look.
// Prefer `className` (e.g. `h-11 sm:h-[60px] w-auto`) when you want responsive
// sizing; the `height` prop only sets Image's intrinsic ratio.
export function BranBoosBlackLogo({
  height = 60,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/branboos-wordmark-black.png"
      alt="BranBoos"
      width={height * 5}
      height={height}
      className={className ?? "w-auto"}
      style={className ? undefined : { height, width: "auto" }}
      priority
    />
  );
}
