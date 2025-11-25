import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Users, 
  Fuel, 
  Settings, 
  Briefcase,
  ExternalLink,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { Vehicle } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface VehicleBookingDetailsProps {
  vehicle: Vehicle;
  rentalDays?: number;
  className?: string;
}

const typeColors: Record<string, string> = {
  Sedan: "bg-blue-100 text-blue-800",
  SUV: "bg-green-100 text-green-800",
  Van: "bg-purple-100 text-purple-800",
  Hatchback: "bg-orange-100 text-orange-800",
  Convertible: "bg-pink-100 text-pink-800",
};

export function VehicleBookingDetails({ 
  vehicle, 
  rentalDays,
  className 
}: VehicleBookingDetailsProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5" />
              {vehicle.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("font-medium", typeColors[vehicle.type] || "bg-gray-100 text-gray-800")}>
                {vehicle.type}
              </Badge>
              {vehicle.withDriver && (
                <Badge variant="secondary" className="gap-1">
                  <UserCheck className="h-3 w-3" />
                  With Driver
                </Badge>
              )}
            </div>
          </div>
          <Link href={`/admin/vehicles/${vehicle.id}/edit`} passHref>
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Edit Vehicle
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.capacity} passengers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.luggage} luggage</span>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="flex items-baseline gap-2 pt-2 border-t">
          <span className="text-2xl font-bold text-primary">
            ₱{vehicle.pricePerDay.toLocaleString()}
          </span>
          <span className="text-muted-foreground">/day</span>
          {rentalDays && rentalDays > 1 && (
            <span className="text-sm text-muted-foreground ml-2">
              × {rentalDays} days = ₱{(vehicle.pricePerDay * rentalDays).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Available Stock:</span>
          <Badge variant={vehicle.stockCount > 0 ? "outline" : "destructive"}>
            {vehicle.stockCount} {vehicle.stockCount === 1 ? "unit" : "units"}
          </Badge>
        </div>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Features</p>
            <ul className="grid grid-cols-2 gap-2">
              {vehicle.features.map((feature, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

