import { BOOKING_STATUS_META } from "@/lib/constants";
import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Pastille de statut colorée pour une réservation.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const meta = BOOKING_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.color,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}
