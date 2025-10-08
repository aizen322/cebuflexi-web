import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Car, Users, Fuel, Settings, MapPin, Phone, Mail, User, CreditCard, Shield, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { vehicles } from "@/lib/mockData";
import { Vehicle } from "@/types";

export default function CarRentalBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const vehicle = vehicles.find((v) => v.id === id);

  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [addOns, setAddOns] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    pickupLocation: "",
    specialRequests: "",
  });

  if (!vehicle) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
            <p className="text-gray-600 mb-8">The vehicle you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/car-rentals")}>Back to Car Rentals</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const rentalDays = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) : 0;
  
  const addOnPrices: { [key: string]: number } = {
    gps: 200,
    insurance: 500,
    childSeat: 150,
    dashcam: 250,
    driver: 1500,
  };

  const addOnsTotal = addOns.reduce((sum, addon) => sum + addOnPrices[addon], 0);
  const vehicleTotal = vehicle.pricePerDay * (rentalDays || 1);
  const totalCost = vehicleTotal + addOnsTotal;

  const handleAddOnToggle = (addon: string) => {
    setAddOns((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      vehicle,
      pickupDate,
      returnDate,
      rentalDays,
      addOns,
      totalCost,
      ...formData,
    };

    console.log("Booking submitted:", bookingData);
    alert("Booking request submitted! We'll contact you shortly to confirm your reservation.");
    router.push("/car-rentals");
  };

  return (
    <>
      <Head>
        <title>Book {vehicle.name} | CebuFlexi Tours Car Rentals</title>
        <meta name="description" content={`Book ${vehicle.name} for your Cebu adventure. ${vehicle.type} with ${vehicle.capacity} seats. Starting at ₱${vehicle.pricePerDay}/day.`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="pt-20 pb-12 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              ← Back to Car Rentals
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full md:w-64 h-48 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h2>
                      <Badge className="mb-4">{vehicle.type}</Badge>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{vehicle.capacity} Passengers</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Settings className="h-4 w-4 mr-2" />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Fuel className="h-4 w-4 mr-2" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Car className="h-4 w-4 mr-2" />
                          <span>{vehicle.luggage} Luggage</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Features:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {vehicle.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rental Details</CardTitle>
                  <CardDescription>Select your pickup and return dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Pickup Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} initialFocus disabled={(date) => date < new Date()} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Return Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {returnDate ? format(returnDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus disabled={(date) => !pickupDate || date <= pickupDate} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Select name="pickupLocation" onValueChange={(value) => setFormData({ ...formData, pickupLocation: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select pickup location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cebu-airport">Mactan-Cebu International Airport</SelectItem>
                          <SelectItem value="cebu-city">Cebu City Center</SelectItem>
                          <SelectItem value="mactan">Mactan Island Hotels</SelectItem>
                          <SelectItem value="mandaue">Mandaue City</SelectItem>
                          <SelectItem value="custom">Custom Location (Specify in notes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {rentalDays > 0 && (
                      <div className="flex items-center justify-center bg-blue-50 rounded-lg p-4">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-lg font-semibold text-blue-900">
                          {rentalDays} {rentalDays === 1 ? "Day" : "Days"} Rental
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add-Ons & Extras</CardTitle>
                  <CardDescription>Enhance your rental experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicle.withDriver && (
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Checkbox id="driver" checked={addOns.includes("driver")} onCheckedChange={() => handleAddOnToggle("driver")} />
                          <Label htmlFor="driver" className="flex-1 cursor-pointer">
                            <div className="font-semibold">Professional Driver</div>
                            <div className="text-sm text-gray-600">Experienced local driver included</div>
                          </Label>
                        </div>
                        <span className="font-semibold">₱1,500/day</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="gps" checked={addOns.includes("gps")} onCheckedChange={() => handleAddOnToggle("gps")} />
                        <Label htmlFor="gps" className="flex-1 cursor-pointer">
                          <div className="font-semibold">GPS Navigation</div>
                          <div className="text-sm text-gray-600">Never get lost in Cebu</div>
                        </Label>
                      </div>
                      <span className="font-semibold">₱200/day</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="insurance" checked={addOns.includes("insurance")} onCheckedChange={() => handleAddOnToggle("insurance")} />
                        <Label htmlFor="insurance" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Full Insurance Coverage</div>
                          <div className="text-sm text-gray-600">Complete peace of mind</div>
                        </Label>
                      </div>
                      <span className="font-semibold">₱500/day</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="childSeat" checked={addOns.includes("childSeat")} onCheckedChange={() => handleAddOnToggle("childSeat")} />
                        <Label htmlFor="childSeat" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Child Safety Seat</div>
                          <div className="text-sm text-gray-600">Keep your little ones safe</div>
                        </Label>
                      </div>
                      <span className="font-semibold">₱150/day</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="dashcam" checked={addOns.includes("dashcam")} onCheckedChange={() => handleAddOnToggle("dashcam")} />
                        <Label htmlFor="dashcam" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Dash Camera</div>
                          <div className="text-sm text-gray-600">Record your journey</div>
                        </Label>
                      </div>
                      <span className="font-semibold">₱250/day</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Enter your contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="mt-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="mt-2" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required className="mt-2" />
                    </div>

                    <div>
                      <Label htmlFor="specialRequests">Special Requests or Notes</Label>
                      <Textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Any special requirements or requests?" className="mt-2 min-h-[100px]" />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">{vehicle.type}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    {pickupDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pickup:</span>
                        <span className="font-medium">{format(pickupDate, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {returnDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return:</span>
                        <span className="font-medium">{format(returnDate, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {rentalDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{rentalDays} {rentalDays === 1 ? "Day" : "Days"}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vehicle Rental</span>
                      <span>₱{vehicleTotal.toLocaleString()}</span>
                    </div>
                    {addOns.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-gray-700">Add-ons:</div>
                        {addOns.map((addon) => (
                          <div key={addon} className="flex justify-between text-sm pl-4">
                            <span className="text-gray-600 capitalize">{addon === "gps" ? "GPS" : addon}</span>
                            <span>₱{(addOnPrices[addon] * (rentalDays || 1)).toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">₱{totalCost.toLocaleString()}</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                    <Shield className="h-5 w-5 mb-2" />
                    <p className="font-semibold mb-1">Secure Booking</p>
                    <p className="text-xs">Your information is protected and secure</p>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!pickupDate || !returnDate || !formData.firstName || !formData.email}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Booking
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By booking, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}