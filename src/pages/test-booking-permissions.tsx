import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export default function TestBookingPermissionsPage() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; error?: any } | null>(null);
  const [authStatus, setAuthStatus] = useState<{ authenticated: boolean; uid?: string; token?: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, [user]);

  async function checkAuth() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        setAuthStatus({
          authenticated: true,
          uid: currentUser.uid,
          token: token.substring(0, 20) + "...",
        });
      } catch (error) {
        setAuthStatus({ authenticated: false });
      }
    } else {
      setAuthStatus({ authenticated: false });
    }
  }

  async function testBookingCreation() {
    if (!user) {
      setResult({ success: false, message: "Please log in first" });
      return;
    }

    // Check Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setResult({ 
        success: false, 
        message: "❌ Firebase Auth shows no authenticated user. Please sign out and sign back in.",
        error: {
          code: "auth/no-user",
          message: "Firebase Auth currentUser is null",
        }
      });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      // Verify we can get a token
      const token = await currentUser.getIdToken();
      console.log("Auth token obtained:", token.substring(0, 20) + "...");

      // Create a minimal test booking with exact structure
      const testBooking = {
        userId: currentUser.uid,
        userEmail: currentUser.email || user.email || "test@example.com",
        userName: currentUser.displayName || user.displayName || "Test User",
        bookingType: "tour",
        startDate: Timestamp.fromDate(new Date()),
        endDate: Timestamp.fromDate(new Date()),
        totalPrice: 1000,
        status: "pending",
      };

      console.log("Attempting to create booking with data:", testBooking);

      const docRef = await addDoc(collection(db, "bookings"), testBooking);
      
      console.log("Booking created successfully:", docRef.id);
      
      // Clean up - delete the test booking
      try {
        const deleteRef = doc(db, "bookings", docRef.id);
        await deleteDoc(deleteRef);
      } catch (deleteError) {
        console.warn("Could not delete test booking:", deleteError);
      }

      setResult({
        success: true,
        message: "✅ Booking creation test passed! Rules are working correctly.",
      });
    } catch (error: any) {
      console.error("Test booking error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      setResult({
        success: false,
        message: `❌ Booking creation failed: ${error.message}`,
        error: {
          code: error.code,
          message: error.message,
          details: error.toString(),
          stack: error.stack,
        },
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Booking Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Test if Firestore rules allow booking creation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.displayName || "Not set"}</p>
                <p><strong>Role:</strong> {user.role || "user"}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Not logged in</p>
            )}
            
            {authStatus && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="font-semibold mb-2">Firebase Auth Status:</p>
                <div className="space-y-1 text-sm">
                  <p>Authenticated: {authStatus.authenticated ? "✅ Yes" : "❌ No"}</p>
                  {authStatus.uid && <p>UID: {authStatus.uid}</p>}
                  {authStatus.token && <p>Token: {authStatus.token}</p>}
                </div>
                {!authStatus.authenticated && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      Firebase Auth shows you're not authenticated. This is why bookings fail!
                      <br />
                      Try signing out and signing back in.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Booking Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testBookingCreation} disabled={testing || !user}>
              {testing ? "Testing..." : "Test Create Booking"}
            </Button>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{result.message}</p>
                    {result.error && (
                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        <p><strong>Code:</strong> {result.error.code}</p>
                        <p><strong>Message:</strong> {result.error.message}</p>
                        {result.error.details && (
                          <p><strong>Details:</strong> {result.error.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>What this tests:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Firestore rules allow authenticated users to create bookings</li>
                <li>Booking data validation passes</li>
                <li>User authentication is working</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Make sure you've deployed the updated Firestore rules!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

