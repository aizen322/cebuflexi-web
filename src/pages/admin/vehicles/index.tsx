import { useState, useEffect } from "react";
import Head from "next/head";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, Eye, EyeOff } from "lucide-react";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { Vehicle } from "@/types";
import { toggleVehicleAvailability } from "@/services/admin/vehicleService";

export default function AdminVehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.VEHICLES),
      (snapshot) => {
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Vehicle[];
        setVehicles(vehiclesData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleToggleAvailability(vehicleId: string) {
    try {
      await toggleVehicleAvailability(vehicleId);
      toast({
        title: "Success",
        description: "Vehicle availability updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    }
  }

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Vehicles - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
            <p className="text-muted-foreground mt-1">
              Manage your vehicle fleet and rental inventory
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p>Loading...</p>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No vehicles found. Seed data to add vehicles.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                      <div className="relative h-48">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        {vehicle.available ? (
                          <Badge className="absolute top-2 right-2">Available</Badge>
                        ) : (
                          <Badge variant="secondary" className="absolute top-2 right-2">Unavailable</Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                        <div className="mt-2">
                          <p className="font-bold">₱{vehicle.pricePerDay.toLocaleString()}/day</p>
                          <p className="text-xs text-muted-foreground">
                            Capacity: {vehicle.capacity} · Stock: {vehicle.stockCount}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => handleToggleAvailability(vehicle.id)}
                        >
                          {vehicle.available ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Mark Unavailable
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Mark Available
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}


