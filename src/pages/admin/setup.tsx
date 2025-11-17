import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminSetupPage() {
  const { user } = useAuth();
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSetup() {
    if (!secret || !email) {
      setResult({ success: false, message: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/setup-first-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || "Admin role granted successfully! Please sign out and sign back in." });
      } else {
        setResult({ success: false, message: data.error || "Failed to setup admin" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Grant admin privileges to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Currently logged in as: <strong>{user.email}</strong>
                <br />
                Role: <strong>{user.role || "user"}</strong>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Admin Setup Secret</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter ADMIN_SETUP_SECRET"
            />
            <p className="text-xs text-muted-foreground">
              This should match the ADMIN_SETUP_SECRET in your .env.local file
            </p>
          </div>

          <Button
            onClick={handleSetup}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Setting up..." : "Grant Admin Access"}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Note:</strong> After granting admin access:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Sign out of your account</li>
              <li>Sign back in</li>
              <li>Visit /admin to access the dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

