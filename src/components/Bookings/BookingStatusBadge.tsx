import { Badge } from "@/components/ui/badge";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface StatusConfig {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    variant: "secondary",
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300",
  },
  confirmed: {
    variant: "default",
    label: "Confirmed",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-300",
  },
  cancelled: {
    variant: "destructive",
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-300",
  },
  completed: {
    variant: "outline",
    label: "Completed",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300",
  },
};

interface BookingStatusBadgeProps {
  status: string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as BookingStatus;
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

