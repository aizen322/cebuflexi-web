import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  MapPin, 
  Clock, 
  Users, 
  ChevronDown, 
  ExternalLink,
  CheckCircle2,
  Utensils
} from "lucide-react";
import { Tour } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface TourBookingDetailsProps {
  tour: Tour;
  className?: string;
}

const categoryColors: Record<string, string> = {
  Beach: "bg-blue-100 text-blue-800",
  Adventure: "bg-orange-100 text-orange-800",
  Cultural: "bg-purple-100 text-purple-800",
  Food: "bg-green-100 text-green-800",
};

export function TourBookingDetails({ tour, className }: TourBookingDetailsProps) {
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isInclusionsOpen, setIsInclusionsOpen] = useState(false);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{tour.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("font-medium", categoryColors[tour.category] || "bg-gray-100 text-gray-800")}>
                {tour.category}
              </Badge>
              {tour.featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
          </div>
          <Link href={`/admin/tours/${tour.id}/edit`} passHref>
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Edit Tour
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tour Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{tour.duration} {tour.duration === 1 ? "day" : "days"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{tour.groupSize.min}-{tour.groupSize.max} guests</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-primary">₱{tour.price.toLocaleString()}</span>
            <span className="text-muted-foreground">/person</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground">{tour.shortDescription}</p>
        </div>

        {/* Itinerary Collapsible */}
        {tour.itinerary && tour.itinerary.length > 0 && (
          <Collapsible open={isItineraryOpen} onOpenChange={setIsItineraryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-sm font-medium">
                  Itinerary ({tour.itinerary.length} {tour.itinerary.length === 1 ? "day" : "days"})
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isItineraryOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {tour.itinerary.map((day) => (
                <div key={day.day} className="border-l-2 border-primary/30 pl-4 py-2">
                  <p className="font-medium text-sm">Day {day.day}: {day.title}</p>
                  {day.activities.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  )}
                  {day.meals.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Utensils className="h-3 w-3" />
                      <span>{day.meals.join(", ")}</span>
                    </div>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Inclusions Collapsible */}
        {tour.inclusions && tour.inclusions.length > 0 && (
          <Collapsible open={isInclusionsOpen} onOpenChange={setIsInclusionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-sm font-medium">
                  What&apos;s Included ({tour.inclusions.length} items)
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isInclusionsOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tour.inclusions.map((inclusion, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {inclusion}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

