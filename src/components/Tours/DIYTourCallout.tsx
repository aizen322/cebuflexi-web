import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, Route, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DIYTourCallout() {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-20"></div>
              <div className="relative bg-white rounded-full p-4 shadow-sm">
                <Route className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Want to create your own adventure?
            </h3>
            <p className="text-gray-700 text-sm md:text-base">
              Build your own custom tour by selecting the landmarks and attractions that interest you most. 
              Set your own pace and create your perfect Cebu experience.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Link href="/custom-itinerary">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Custom Tour
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

