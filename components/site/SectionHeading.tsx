import type { ReactNode } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  /** Light text for dark backgrounds. */
  invert?: boolean;
  action?: ReactNode;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
  action,
}: SectionHeadingProps) {
  return (
    <AnimatedSection
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      )}
    >
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        <span className="eyebrow">{eyebrow}</span>
        <h2
          className={cn(
            "mt-3 max-w-2xl text-3xl font-extrabold md:text-4xl",
            invert ? "text-white" : "text-navy"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-3 max-w-xl text-base", invert ? "text-white/70" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </AnimatedSection>
  );
}
