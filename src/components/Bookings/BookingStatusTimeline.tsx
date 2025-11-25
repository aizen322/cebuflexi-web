import { CheckCircle, Clock, XCircle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStatusTimelineProps {
  status: string;
  createdAt?: Date;
  className?: string;
}

const statuses = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

export function BookingStatusTimeline({ 
  status, 
  createdAt,
  className 
}: BookingStatusTimelineProps) {
  const isCancelled = status === "cancelled";
  
  // Find current status index
  const currentIndex = statuses.findIndex((s) => s.key === status);
  
  if (isCancelled) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg", className)}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-red-700">Booking Cancelled</p>
          {createdAt && (
            <p className="text-sm text-red-600">
              Originally created on {createdAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-muted/30 rounded-lg", className)}>
      <div className="flex items-center justify-between">
        {statuses.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentIndex >= index;
          const isCurrent = currentIndex === index;
          const isLast = index === statuses.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted
                      ? isCurrent
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-green-500 border-green-500 text-white"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <CircleDot className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all",
                    currentIndex > index ? "bg-green-500" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

