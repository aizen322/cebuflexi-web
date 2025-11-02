import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import Head from "next/head";

export default function LoadingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If auth is loaded and user is authenticated, redirect to home after a brief delay
    if (!loading && user) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2500); // 2.5 second delay

      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // If user is not authenticated, redirect to home immediately
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Loading - CebuFlexi Tours</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-lg text-gray-600">Getting everything ready for you...</p>
          </div>
        </div>
      </div>
    </>
  );
}

