import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDebugPage() {
  const { user } = useAuth();
  const [tokenClaims, setTokenClaims] = useState<any>(null);
  const [firestoreRole, setFirestoreRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, [user]);

  async function checkRole() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get token claims
      const currentUser = auth.currentUser;
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        setTokenClaims(tokenResult.claims);
      }

      // Get Firestore role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setFirestoreRole(userDoc.data().role || "not set");
      } else {
        setFirestoreRole("document not found");
      }
    } catch (error: any) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshToken() {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true); // Force refresh
      await checkRole();
      alert("Token refreshed! Please check the values below.");
    }
  }

  const hasAdminClaim = tokenClaims?.role === "admin";
  const hasAdminInFirestore = firestoreRole === "admin";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Role Debug</h1>
          <p className="text-muted-foreground mt-1">
            Check your current authentication status
          </p>
        </div>

        {!user ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please log in first</AlertDescription>
          </Alert>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || "Not set"}</p>
                <p><strong>Role (from AuthContext):</strong> {user.role || "not set"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Firebase Auth Token Claims</CardTitle>
                <CardDescription>
                  This is what Firestore rules check for permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {hasAdminClaim ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>
                        <strong>Role in Token:</strong> {tokenClaims?.role || "not set"}
                      </span>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-mono">
                        <strong>All Claims:</strong>
                        <pre className="mt-2">{JSON.stringify(tokenClaims, null, 2)}</pre>
                      </p>
                    </div>
                    {!hasAdminClaim && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Problem:</strong> Your token does not have admin role in custom claims.
                          <br />
                          <br />
                          <strong>To fix:</strong>
                          <ol className="list-decimal list-inside space-y-1 ml-2 mt-2">
                            <li>Go to Firebase Console → Authentication → Users</li>
                            <li>Find your user ({user.email})</li>
                            <li>Click on the user → Custom Claims tab</li>
                            <li>Add custom claim: Key = <code className="bg-background px-1 rounded">role</code>, Value = <code className="bg-background px-1 rounded">admin</code></li>
                            <li>Click "Add" and save</li>
                            <li>Come back here and click "Refresh Token" below</li>
                            <li>Sign out and sign back in</li>
                          </ol>
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button onClick={refreshToken} variant="outline">
                      Refresh Token
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Firestore User Document</CardTitle>
                <CardDescription>
                  This is stored in the users collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {hasAdminInFirestore ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>
                        <strong>Role in Firestore:</strong> {firestoreRole}
                      </span>
                    </div>
                    {!hasAdminInFirestore && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Problem:</strong> Your Firestore user document does not have role: "admin"
                          <br />
                          <br />
                          <strong>To fix:</strong>
                          <ol className="list-decimal list-inside space-y-1 ml-2 mt-2">
                            <li>Go to Firebase Console → Firestore Database</li>
                            <li>Navigate to <code className="bg-background px-1 rounded">users</code> collection</li>
                            <li>Find your user document (UID: {user.uid})</li>
                            <li>Add or update field: <code className="bg-background px-1 rounded">role</code> = <code className="bg-background px-1 rounded">admin</code></li>
                            <li>Save the document</li>
                          </ol>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {hasAdminClaim && hasAdminInFirestore ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>✅ All good!</strong> You have admin role in both places.
                      <br />
                      If you still see permission errors, try:
                      <ol className="list-decimal list-inside space-y-1 ml-2 mt-2">
                        <li>Sign out completely</li>
                        <li>Clear browser cache/cookies</li>
                        <li>Sign back in</li>
                        <li>Visit /admin again</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>❌ Issues found:</strong>
                      <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                        {!hasAdminClaim && <li>Missing admin role in Firebase Auth Custom Claims</li>}
                        {!hasAdminInFirestore && <li>Missing admin role in Firestore user document</li>}
                      </ul>
                      <p className="mt-2">Fix the issues above, then refresh this page.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

