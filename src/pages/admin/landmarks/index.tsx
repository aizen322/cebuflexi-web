import { useState, useEffect, ReactElement } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import Head from "next/head";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { Landmark } from "@/types";
import { Plus, Edit } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";

const AdminLandmarksPage: NextPageWithLayout = () => {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.LANDMARKS),
      (snapshot) => {
        const landmarksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Landmark[];
        setLandmarks(landmarksData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Landmarks - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Landmarks</h1>
              <p className="text-muted-foreground mt-1">
                Manage landmarks for custom itinerary building
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/landmarks/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Landmark
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p>Loading...</p>
              ) : landmarks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No landmarks found. Seed data to add landmarks.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {landmarks.map((landmark) => (
                    <Card key={landmark.id}>
                      <AppImage
                        src={landmark.image || "/images/placeholder.jpg"}
                        alt={landmark.name}
                        fill
                        containerClassName="relative h-32 bg-gray-200 rounded-t-lg"
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{landmark.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {landmark.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{landmark.category}</Badge>
                          <Badge variant="secondary">{landmark.tourType}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Duration: {landmark.estimatedDuration} min
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          asChild
                        >
                          <Link href={`/admin/landmarks/${landmark.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
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
};

AdminLandmarksPage.getLayout = (page: ReactElement) => page;

export default AdminLandmarksPage;


