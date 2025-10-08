
import Head from "next/head";
import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, Fuel, Settings, Check, Car } from "lucide-react";
import { vehicles } from "@/lib/mockData";
import { Vehicle } from "@/types";

export default function CarRentalsPage() {
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles);
  const [filters, setFilters] = useState({
    withDriver: "all",
    transmission: "all",
    fuelType: "all"
  });

  const [rentalCalculator, setRentalCalculator] = useState({
    days: 1,
    mileage: 100,
    insurance: false,
    gps: false,
    childSeat: false
  });

  const applyFilters = () => {
    let filtered = [...vehicles];

    if (filters.withDriver !== "all") {
      const hasDriver = filters.withDriver === "with";
      filtered = filtered.filter(v => v.withDriver === hasDriver);
    }

    if (filters.transmission !== "all") {
      filtered = filtered.filter(v => v.transmission === filters.transmission);
    }

    if (filters.fuelType !== "all") {
      filtered = filtered.filter(v => v.fuelType === filters.fuelType);
    }

    setFilteredVehicles(filtered);
  };

  const calculateTotal = (basePrice: number) => {
    let total = basePrice * rentalCalculator.days;
    if (rentalCalculator.insurance) total += 500 * rentalCalculator.days;
    if (rentalCalculator.gps) total += 200 * rentalCalculator.days;
    if (rentalCalculator.childSeat) total += 150 * rentalCalculator.days;
    return total;
  };

  return (
    <>
      <Head>
        <title>Car Rentals in Cebu | Rent a Car with Driver | CebuFlexi Tours</title>
        <meta name="description" content="Rent a car in Cebu with or without driver. Choose from sedans, SUVs, and vans. Flexible rental options, airport pickup available. Book your Cebu car rental today." />
        <meta name="keywords" content="car rental Cebu, rent a car Cebu airport, Cebu car rental with driver, cheap car rental Cebu, SUV rental Cebu Philippines" />
        <link rel="canonical" href="https://cebuflexitours.com/car-rentals" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen">
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Cebu Your Way
            </h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Rent a reliable vehicle with flexible options. Choose from sedans, SUVs, or vans - with or without a driver. Perfect for airport transfers, island tours, or extended stays.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-1/4">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Filter Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Driver Option</Label>
                      <RadioGroup value={filters.withDriver} onValueChange={(val) => setFilters({...filters, withDriver: val})}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="driver-all" />
                          <Label htmlFor="driver-all" className="cursor-pointer">All Options</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="with" id="driver-with" />
                          <Label htmlFor="driver-with" className="cursor-pointer">With Driver</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="without" id="driver-without" />
                          <Label htmlFor="driver-without" className="cursor-pointer">Self-Drive</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="transmission" className="text-base font-semibold mb-3 block">Transmission</Label>
                      <Select value={filters.transmission} onValueChange={(val) => setFilters({...filters, transmission: val})}>
                        <SelectTrigger id="transmission">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fuelType" className="text-base font-semibold mb-3 block">Fuel Type</Label>
                      <Select value={filters.fuelType} onValueChange={(val) => setFilters({...filters, fuelType: val})}>
                        <SelectTrigger id="fuelType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Gasoline">Gasoline</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={applyFilters} className="w-full bg-green-600 hover:bg-green-700">
                      Apply Filters
                    </Button>
                  </CardContent>
                </Card>
              </aside>

              <div className="lg:w-3/4">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Available Vehicles</h2>
                  <p className="text-gray-600">Choose from {filteredVehicles.length} vehicles</p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-12">
                  {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-64 md:h-auto relative">
                          <img
                            src={vehicle.image}
                            alt={`${vehicle.name} - Car rental in Cebu`}
                            className="w-full h-full object-cover"
                          />
                          {vehicle.withDriver && (
                            <Badge className="absolute top-4 left-4 bg-green-600">With Driver Available</Badge>
                          )}
                        </div>

                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-2xl font-bold mb-1">{vehicle.name}</h3>
                                <p className="text-gray-600">{vehicle.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold text-green-600">₱{vehicle.pricePerDay.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">per day</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-green-600" />
                                <span>{vehicle.capacity} seats</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Settings className="h-4 w-4 mr-2 text-green-600" />
                                <span>{vehicle.transmission}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Fuel className="h-4 w-4 mr-2 text-green-600" />
                                <span>{vehicle.fuelType}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Car className="h-4 w-4 mr-2 text-green-600" />
                                <span>{vehicle.luggage} bags</span>
                              </div>
                            </div>

                            <div className="space-y-1 mb-4">
                              {vehicle.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-sm text-gray-600">
                                  <Check className="h-4 w-4 mr-2 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => window.location.href = `/car-rentals/booking/${vehicle.id}`}
                            >
                              Book Now
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.location.href = `/car-rentals/booking/${vehicle.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rental Price Calculator</CardTitle>
                    <CardDescription>Estimate your total rental cost with add-ons</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="days">Number of Days</Label>
                        <Input
                          id="days"
                          type="number"
                          min="1"
                          value={rentalCalculator.days}
                          onChange={(e) => setRentalCalculator({...rentalCalculator, days: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mileage">Estimated Mileage (km/day)</Label>
                        <Input
                          id="mileage"
                          type="number"
                          min="50"
                          value={rentalCalculator.mileage}
                          onChange={(e) => setRentalCalculator({...rentalCalculator, mileage: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Add-ons</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="insurance"
                          checked={rentalCalculator.insurance}
                          onCheckedChange={(checked) => setRentalCalculator({...rentalCalculator, insurance: checked as boolean})}
                        />
                        <Label htmlFor="insurance" className="cursor-pointer">
                          Full Insurance Coverage (+₱500/day)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gps"
                          checked={rentalCalculator.gps}
                          onCheckedChange={(checked) => setRentalCalculator({...rentalCalculator, gps: checked as boolean})}
                        />
                        <Label htmlFor="gps" className="cursor-pointer">
                          GPS Navigation (+₱200/day)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="childSeat"
                          checked={rentalCalculator.childSeat}
                          onCheckedChange={(checked) => setRentalCalculator({...rentalCalculator, childSeat: checked as boolean})}
                        />
                        <Label htmlFor="childSeat" className="cursor-pointer">
                          Child Safety Seat (+₱150/day)
                        </Label>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Example: Toyota Fortuner at ₱3,500/day</p>
                      <div className="text-2xl font-bold text-green-600">
                        Total Estimate: ₱{calculateTotal(3500).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
