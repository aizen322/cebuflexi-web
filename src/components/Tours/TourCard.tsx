
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Star } from "lucide-react";
import { Tour } from "@/types";
import { motion } from "framer-motion";

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={tour.images[0]}
          alt={`${tour.title} - Cebu tour package`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <Badge className="absolute top-4 left-4 bg-blue-600 text-white transition-transform duration-300 group-hover:scale-110">
          {tour.category}
        </Badge>
        {tour.featured && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </motion.div>
        )}
      </div>

      <CardHeader className="flex-grow">
        <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">{tour.title}</CardTitle>
        <CardDescription className="line-clamp-2">{tour.shortDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center transition-transform duration-300 hover:translate-x-1">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            <span>{tour.duration} {tour.duration === 1 ? "Day" : "Days"}</span>
          </div>
          <div className="flex items-center transition-transform duration-300 hover:translate-x-1">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            <span>{tour.groupSize.min}-{tour.groupSize.max} People</span>
          </div>
          <div className="flex items-center transition-transform duration-300 hover:translate-x-1">
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">Book Now</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
