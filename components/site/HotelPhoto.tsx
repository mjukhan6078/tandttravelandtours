import Image from "next/image";
import { Building2, ImageOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hotel } from "@/lib/site/hotels";

/** Hotel photo, or a branded placeholder until one is added in lib/site/hotels.ts. */
export default function HotelPhoto({
  hotel,
  className,
  sizes = "(max-width: 768px) 100vw, 400px",
  showStars = true,
  compact = false,
}: {
  hotel: Hotel;
  className?: string;
  sizes?: string;
  showStars?: boolean;
  /** Small thumbnail: no stars badge or placeholder text. */
  compact?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {hotel.image ? (
        <>
          <Image
            src={hotel.image}
            alt={hotel.name}
            fill
            sizes={sizes}
            className="object-cover"
            style={hotel.imagePosition ? { objectPosition: hotel.imagePosition } : undefined}
          />
          {!compact && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent"
              aria-hidden
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-secondary to-surface text-primary/40">
          <div className="flex flex-col items-center gap-1.5">
            <Building2 className={compact ? "size-6" : "size-10"} />
            {!compact && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-primary/60">
                <ImageOff className="size-3.5" />
                Photo coming soon
              </span>
            )}
          </div>
        </div>
      )}
      {hotel.image && hotel.photoCredit && !compact && (
        <p className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
          Photo:{" "}
          <a
            href={hotel.photoCredit.source}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {hotel.photoCredit.author}
          </a>
          ,{" "}
          <a
            href={hotel.photoCredit.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {hotel.photoCredit.license}
          </a>
        </p>
      )}
      {showStars && !compact && (
        <span
          className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-navy/70 px-2.5 py-1 backdrop-blur"
          aria-label={`${hotel.stars} star hotel`}
        >
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-cta text-cta" />
          ))}
        </span>
      )}
    </div>
  );
}
