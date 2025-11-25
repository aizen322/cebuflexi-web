import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingPriceBreakdownProps {
  bookingType: string;
  totalPrice: number;
  guests?: number;
  groupSize?: number;
  startDate: Date;
  endDate: Date;
  basePrice?: number; // Per person for tours, per day for vehicles
  className?: string;
}

export function BookingPriceBreakdown({
  bookingType,
  totalPrice,
  guests,
  groupSize,
  startDate,
  endDate,
  basePrice,
  className,
}: BookingPriceBreakdownProps) {
  const numberOfGuests = guests || groupSize || 1;
  
  // Calculate rental days for vehicles
  const rentalDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Calculate base price if not provided
  const calculatedBasePrice = basePrice || (
    bookingType === "vehicle" 
      ? totalPrice / rentalDays 
      : totalPrice / numberOfGuests
  );

  const isVehicle = bookingType === "vehicle";
  const isCustomTour = bookingType === "custom-tour";

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isVehicle ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Rate</span>
              <span>₱{calculatedBasePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Days</span>
              <span>× {rentalDays} {rentalDays === 1 ? "day" : "days"}</span>
            </div>
          </>
        ) : isCustomTour ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custom Itinerary</span>
              <span>₱{(totalPrice / numberOfGuests).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Guests</span>
              <span>× {numberOfGuests} {numberOfGuests === 1 ? "guest" : "guests"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Person</span>
              <span>₱{calculatedBasePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Guests</span>
              <span>× {numberOfGuests} {numberOfGuests === 1 ? "guest" : "guests"}</span>
            </div>
          </>
        )}

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-primary">
            ₱{totalPrice.toLocaleString()}
          </span>
        </div>

        {/* Duration info */}
        <div className="pt-3 border-t mt-3">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            {isVehicle ? (
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rental Period</p>
                <p className="text-base font-semibold text-foreground">
                  {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-sm text-primary font-medium mt-1">
                  {rentalDays} {rentalDays === 1 ? "day" : "days"}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tour Date</p>
                <p className="text-base font-semibold text-foreground">
                  {startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

