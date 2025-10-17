import { useState } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface BookingValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  hasPending: boolean;
  hasConfirmed: boolean;
  pendingCount: number;
  confirmedCount: number;
  bookings: any[];
}

export function BookingValidationDialog({
  isOpen,
  onClose,
  onProceed,
  hasPending,
  hasConfirmed,
  pendingCount,
  confirmedCount,
  bookings
}: BookingValidationDialogProps) {
  const router = useRouter();
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canProceed = !hasPending; // Only allow if no pending bookings

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasPending ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pending Booking Found
              </>
            ) : hasConfirmed ? (
              <>
                <CheckCircle className="h-5 w-5 text-blue-500" />
                Existing Bookings Reminder
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Ready to Book
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {hasPending 
              ? "You have pending tour bookings that need to be resolved first."
              : hasConfirmed
              ? "You have confirmed tour bookings. Please review before proceeding."
              : "You can proceed with your new booking."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasPending && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cannot proceed:</strong> You have {pendingCount} pending tour booking{pendingCount > 1 ? 's' : ''} that must be confirmed or cancelled before making a new booking.
              </AlertDescription>
            </Alert>
          )}

          {hasConfirmed && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reminder:</strong> You have {confirmedCount} confirmed tour booking{confirmedCount > 1 ? 's' : ''}. Please ensure you're available for all scheduled tours.
              </AlertDescription>
            </Alert>
          )}

          {(hasPending || hasConfirmed) && (
            <div className="space-y-3">
              <h4 className="font-semibold">Your Existing Tour Bookings:</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {bookings.map((booking, index) => (
                  <div key={booking.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">
                          {formatDate(booking.startDate)}
                          {booking.groupSize && (
                            <span className="ml-2 text-gray-600">
                              <Users className="inline h-3 w-3 mr-1" />
                              {booking.groupSize} people
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">Booking ID: {booking.id}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={hasPending ? () => router.push("/account/bookings") : onClose}
            >
              {hasPending ? "Review Bookings" : "Cancel"}
            </Button>
            {canProceed && (
              <Button onClick={onProceed} className="bg-blue-600 hover:bg-blue-700">
                Proceed with New Booking
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
