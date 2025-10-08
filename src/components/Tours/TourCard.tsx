
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Star } from "lucide-react";
import { Tour } from "@/types";

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden">
        <img
          src={tour.images[0]}
          alt={`${tour.title} - Cebu tour package`}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
          {tour.category}
        </Badge>
        {tour.featured && (
          <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>

      <CardHeader className="flex-grow">
        <CardTitle className="text-xl line-clamp-2">{tour.title}</CardTitle>
        <CardDescription className="line-clamp-2">{tour.shortDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            <span>{tour.duration} {tour.duration === 1 ? "Day" : "Days"}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            <span>{tour.groupSize.min}-{tour.groupSize.max} People</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
            <span>{tour.location}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">₱{tour.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500 ml-1">per person</span>
            </div>
            {tour.available ? (
              <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">Sold Out</Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/tours/${tour.id}#book`} className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Now</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
