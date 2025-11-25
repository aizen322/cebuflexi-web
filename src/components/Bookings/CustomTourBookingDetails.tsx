import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  ChevronDown, 
  Route,
  Calendar,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ItineraryLandmark {
  id?: string;
  name: string;
  duration?: number;
  image?: string;
  order?: number;
}

interface DayPlan {
  day: number;
  tourType?: string;
  landmarks: ItineraryLandmark[];
  totalTime?: number;
}

interface CustomTourData {
  landmarks?: ItineraryLandmark[];
  totalTime?: number;
  totalPrice?: number;
  isFullPackage?: boolean;
  duration?: string;
  days?: DayPlan[];
  raw?: string;
}

interface CustomTourBookingDetailsProps {
  customizations?: string;
  itineraryDetails?: string;
  className?: string;
}

// Parse JSON strings safely
const parseCustomTourData = (data: string | undefined): CustomTourData | null => {
  if (!data) return null;

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed as CustomTourData;
  } catch {
    return typeof data === "string" ? { raw: data } : null;
  }
};

export function CustomTourBookingDetails({
  customizations,
  itineraryDetails,
  className,
}: CustomTourBookingDetailsProps) {
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(true);

  const customizationsData = parseCustomTourData(customizations);
  const itineraryData = parseCustomTourData(itineraryDetails);

  // Check if it's a multi-day itinerary
  const isMultiDay = itineraryData?.days && Array.isArray(itineraryData.days) && itineraryData.days.length > 1;

  // Get landmarks - either from days array or directly
  const getAllLandmarks = (): ItineraryLandmark[] => {
    if (itineraryData?.days) {
      return itineraryData.days.flatMap((day) => day.landmarks || []);
    }
    if (itineraryData?.landmarks) {
      return itineraryData.landmarks;
    }
    return [];
  };

  const landmarks = getAllLandmarks();
  const totalTime = itineraryData?.totalTime || customizationsData?.totalTime || 0;
  const isFullPackage = itineraryData?.isFullPackage || customizationsData?.isFullPackage;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Route className="h-5 w-5" />
              Custom Itinerary
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {isMultiDay && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {itineraryData?.days?.length || 2} Days
                </Badge>
              )}
              {isFullPackage && (
                <Badge className="bg-green-100 text-green-800 gap-1">
                  <Package className="h-3 w-3" />
                  Full Package
                </Badge>
              )}
              {!isFullPackage && (
                <Badge variant="outline">Basic Package</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{landmarks.length} landmarks</span>
          </div>
          {totalTime > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {Math.floor(totalTime / 60)}h {totalTime % 60}m total
              </span>
            </div>
          )}
          {itineraryData?.totalPrice && (
            <div className="text-sm">
              <span className="font-semibold text-primary">
                ₱{itineraryData.totalPrice.toLocaleString()}
              </span>
              <span className="text-muted-foreground">/person</span>
            </div>
          )}
        </div>

        {/* Multi-Day Itinerary */}
        {isMultiDay && itineraryData?.days && (
          <div className="space-y-4 pt-2 border-t">
            {itineraryData.days.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Day {day.day}
                    {day.tourType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {day.tourType.replace("-", " ")}
                      </Badge>
                    )}
                  </h4>
                  {day.totalTime && (
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(day.totalTime / 60)}h {day.totalTime % 60}m
                    </span>
                  )}
                </div>
                <ul className="space-y-1 pl-6">
                  {day.landmarks.map((landmark, idx) => (
                    <li key={idx} className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                          {landmark.order || idx + 1}
                        </span>
                        {landmark.name}
                      </span>
                      {landmark.duration && (
                        <span className="text-xs text-muted-foreground">
                          {landmark.duration} min
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Single-Day Landmarks */}
        {!isMultiDay && landmarks.length > 0 && (
          <Collapsible open={isLandmarksOpen} onOpenChange={setIsLandmarksOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto hover:bg-transparent"
              >
                <span className="text-sm font-medium">
                  Landmarks ({landmarks.length})
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isLandmarksOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <ol className="space-y-2">
                {landmarks.map((landmark, idx) => (
                  <li
                    key={idx}
                    className="text-sm flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {landmark.order || idx + 1}
                      </span>
                      {landmark.name}
                    </span>
                    {landmark.duration && (
                      <Badge variant="outline" className="text-xs">
                        {landmark.duration} min
                      </Badge>
                    )}
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Raw data fallback */}
        {!landmarks.length && customizationsData?.raw && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <p className="font-medium mb-1">Customization Details:</p>
            <p>{customizationsData.raw}</p>
          </div>
        )}

        {!landmarks.length && itineraryData?.raw && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <p className="font-medium mb-1">Itinerary Details:</p>
            <p>{itineraryData.raw}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

