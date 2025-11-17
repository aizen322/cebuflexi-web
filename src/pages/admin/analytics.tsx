import { useState, useEffect } from "react";
import Head from "next/head";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { COLLECTIONS } from "@/lib/firestore-collections";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminAnalyticsPage() {
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [bookingsByType, setBookingsByType] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const bookingsSnapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());

      // Group by status
      const statusGroups = bookings.reduce((acc: any, booking: any) => {
        const status = booking.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusGroups).map(([name, value]) => ({
        name,
        value,
      }));

      // Group by type
      const typeGroups = bookings.reduce((acc: any, booking: any) => {
        const type = booking.bookingType || "tour";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const typeData = Object.entries(typeGroups).map(([name, value]) => ({
        name,
        count: value,
      }));

      setBookingsByStatus(statusData);
      setBookingsByType(typeData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Analytics - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Insights and metrics for your business
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}


