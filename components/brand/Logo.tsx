import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** `reversed` for dark backgrounds, `color` for light backgrounds, `auto` switches with theme. */
  variant?: "reversed" | "color" | "auto";
  /** Show only the monogram mark. */
  markOnly?: boolean;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({
  variant = "auto",
  markOnly = false,
  className,
  href = "/",
  priority = false,
}: LogoProps) {
  const width = markOnly ? 44 : 190;
  const height = markOnly ? 44 : 52;

  const reversedSrc = markOnly
    ? "/brand/dwh-monogram-reversed.png"
    : "/brand/dwh-horizontal-reversed.png";
  const colorSrc = markOnly
    ? "/brand/dwh-monogram-reversed.png"
    : "/brand/dwh-horizontal-color.png";

  const imgClass = cn("h-10 w-auto object-contain sm:h-11", markOnly && "h-10 w-10", className);

  const content =
    variant === "auto" ? (
      <>
        <Image
          src={colorSrc}
          alt="Diverse Works Holdings"
          width={width}
          height={height}
          priority={priority}
          className={cn(imgClass, "block dark:hidden")}
        />
        <Image
          src={reversedSrc}
          alt="Diverse Works Holdings"
          width={width}
          height={height}
          priority={priority}
          className={cn(imgClass, "hidden dark:block")}
        />
      </>
    ) : (
      <Image
        src={variant === "color" ? colorSrc : reversedSrc}
        alt="Diverse Works Holdings"
        width={width}
        height={height}
        priority={priority}
        className={imgClass}
      />
    );

  if (!href) return <>{content}</>;

  return (
    <Link href={href} aria-label="Diverse Works Holdings home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
