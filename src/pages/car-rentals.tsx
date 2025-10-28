
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { Users, Fuel, Settings, Check, Car, Search } from "lucide-react";
import { vehicles } from "@/lib/mockData";
import { Vehicle } from "@/types";

export default function CarRentalsPage() {
  const router = useRouter();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles);
  const [filters, setFilters] = useState({
    withDriver: "all",
    transmission: "all",
    fuelType: "all"
  });
  const [appliedFilters, setAppliedFilters] = useState({
    withDriver: "all",
    transmission: "all",
    fuelType: "all"
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Auto-apply filters when search query changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery]);

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.type.toLowerCase().includes(searchTerm)
      );
    }

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
    setAppliedFilters({...filters});
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      withDriver: "all",
      transmission: "all",
      fuelType: "all"
    });
    setAppliedFilters({
      withDriver: "all",
      transmission: "all",
      fuelType: "all"
    });
    setFilteredVehicles(vehicles);
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
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Cebu Your Way
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl">
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
                      <Label className="text-base font-semibold mb-3 block">Search Vehicles</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search by type..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

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

                    <div className="space-y-2 pt-4">
                      <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
                        Apply Filters
                      </Button>
                      <Button onClick={resetFilters} variant="outline" className="w-full">
                        Reset Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              <div className="lg:w-3/4">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {searchQuery.trim() ? (
                      <>
                        Search Results for "{searchQuery}"
                        <span className="text-gray-500 text-lg ml-2">({filteredVehicles.length})</span>
                      </>
                    ) : (
                      <>
                        {appliedFilters.withDriver === "with" ? "With Driver" : 
                         appliedFilters.withDriver === "without" ? "Self-Drive" : "All Vehicles"}
                        <span className="text-gray-500 text-lg ml-2">({filteredVehicles.length})</span>
                      </>
                    )}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-12">
                  {filteredVehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 h-64 md:h-auto relative">
                              <img
                                src={vehicle.image}
                                alt={`${vehicle.type} - Car rental in Cebu`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {vehicle.withDriver && (
                                <Badge className="absolute top-4 left-4 bg-blue-600 transition-transform duration-300 group-hover:scale-110">With Driver Available</Badge>
                              )}
                              <Badge className="absolute top-4 right-4 bg-green-600 text-white transition-transform duration-300 group-hover:scale-110">
                                {vehicle.stockCount} Available
                              </Badge>
                            </div>

                            <div className="md:w-2/3 p-6 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-600 transition-colors duration-300">{vehicle.type}</h3>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">₱{vehicle.pricePerDay.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">per day</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div className="flex items-center text-sm transition-transform duration-300 hover:translate-x-1">
                                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>{vehicle.capacity} seats</span>
                                  </div>
                                  <div className="flex items-center text-sm transition-transform duration-300 hover:translate-x-1">
                                    <Settings className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>{vehicle.transmission}</span>
                                  </div>
                                  <div className="flex items-center text-sm transition-transform duration-300 hover:translate-x-1">
                                    <Fuel className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>{vehicle.fuelType}</span>
                                  </div>
                                  <div className="flex items-center text-sm transition-transform duration-300 hover:translate-x-1">
                                    <Car className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>{vehicle.luggage} bags</span>
                                  </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                  {vehicle.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center text-sm text-gray-600 transition-transform duration-300 hover:translate-x-1">
                                      <Check className="h-4 w-4 mr-2 text-blue-600" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button 
                                  variant="outline" 
                                  className="flex-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105"
                                  onClick={() => router.push(`/car-rentals/booking/${vehicle.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
