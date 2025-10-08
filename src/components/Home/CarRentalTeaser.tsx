
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Check } from "lucide-react";

export function CarRentalTeaser() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <div className="flex items-center mb-4">
              <Car className="h-10 w-10 mr-3" />
              <h2 className="text-4xl md:text-5xl font-bold">
                Explore Cebu Your Way
              </h2>
            </div>
            <p className="text-xl mb-6 text-blue-100">
              Discover Cebu at your own pace with our premium car rental service. Whether you want to drive yourself or prefer a professional driver, we've got you covered.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-lg">Self-drive or with professional driver</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-lg">Flexible rental periods (daily, weekly, monthly)</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-lg">Well-maintained vehicles for all group sizes</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-lg">24/7 roadside assistance</span>
              </div>
            </div>

            <Link href="/car-rentals">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Browse Vehicles
              </Button>
            </Link>
          </div>

          <div className="lg:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop"
                alt="Sedan car rental"
                className="rounded-lg shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop"
                alt="SUV car rental"
                className="rounded-lg shadow-xl mt-8"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
