import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin } from "lucide-react";
import { featuredTours } from "@/lib/mockData";

export function FeaturedTours() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Tour Packages
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the best tours Cebu has to offer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={tour.images[0]}
                  alt={tour.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">{tour.category}</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{tour.title}</CardTitle>
                <CardDescription className="min-h-[48px]">{tour.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{tour.duration} {tour.duration === 1 ? "Day" : "Days"}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{tour.groupSize.min}-{tour.groupSize.max} People</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{tour.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-blue-600">₱{tour.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500"> per person</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/tours/${tour.id}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tours">
            <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              View All Tours
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}