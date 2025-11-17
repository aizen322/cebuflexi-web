import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/components/Bookings/BookingStatusBadge";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Car,
  TrendingUp,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { COLLECTIONS } from "@/lib/firestore-collections";

interface DashboardStats {
  pendingBookings: number;
  totalUsers: number;
  monthlyRevenue: number;
  activeTours: number;
  activeVehicles: number;
}

interface RecentBooking {
  id: string;
  userName: string;
  userEmail: string;
  bookingType: string;
  totalPrice: number;
  status: string;
  createdAt: Date;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pendingBookings: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    activeTours: 0,
    activeVehicles: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, COLLECTIONS.BOOKINGS),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookings = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userName: data.userName || data.guestName || "Unknown",
            userEmail: data.userEmail || data.guestEmail || "",
            bookingType: data.bookingType || "tour",
            totalPrice: data.totalPrice || 0,
            status: data.status || "pending",
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setRecentBookings(bookings);
        setError(null);
      },
      (error) => {
        console.error("Error listening to bookings:", error);
        if (error.code === "permission-denied") {
          setError("Permission denied. Please verify your admin role and Firestore rules are deployed.");
        } else {
          setError("Error loading bookings: " + error.message);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Use optimized stats service instead of full collection scans
      const { getDashboardStats } = await import("@/services/admin/statsService");
      const statsData = await getDashboardStats();

      setError(null);

      setStats({
        pendingBookings: statsData.pendingBookings,
        totalUsers: statsData.totalUsers,
        monthlyRevenue: statsData.monthlyRevenue,
        activeTours: statsData.activeTours,
        activeVehicles: statsData.activeVehicles,
      });

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.code === "permission-denied") {
        setError("Permission denied. Please verify your admin role and Firestore rules are deployed.");
      } else {
        setError("Error loading dashboard data: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }


  return (
    <AdminProtectedRoute>
      <Head>
        <title>Dashboard - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your tour business operations
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2 text-sm">
                  <p>To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Deploy Firestore rules: <code className="bg-muted px-1 rounded">firebase deploy --only firestore:rules</code></li>
                    <li>Verify admin role in Firebase Console (Custom Claims)</li>
                    <li>Update user document in Firestore with <code className="bg-muted px-1 rounded">role: "admin"</code></li>
                    <li>Sign out and sign back in</li>
                  </ol>
                  <p className="mt-2">
                    Or visit <Link href="/admin/setup" className="underline">/admin/setup</Link> to grant admin access.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-yellow-700">{stats.pendingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require your attention
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered accounts
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ₱{stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      From confirmed bookings
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Offerings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.activeTours + stats.activeVehicles}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.activeTours} tours · {stats.activeVehicles} vehicles
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activity with real-time updates</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/bookings">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {booking.bookingType === "tour" ? (
                            <MapPin className="h-5 w-5" />
                          ) : (
                            <Car className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{booking.userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{booking.userEmail}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-sm font-medium">₱{booking.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(booking.createdAt, "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookingStatusBadge status={booking.status} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/tours/new")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Add New Tour
                </CardTitle>
                <CardDescription>Create a new tour package</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/vehicles/new")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Add New Vehicle
                </CardTitle>
                <CardDescription>Add a vehicle to your fleet</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/bookings")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Manage Bookings
                </CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}


