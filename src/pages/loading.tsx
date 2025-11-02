import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Head from "next/head";

export default function LoadingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [canRedirect, setCanRedirect] = React.useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    // Set a flag that allows redirect only after 2 seconds from page load
    const minDisplayTime = 1000; // 1 second
    const timer = setTimeout(() => {
      setCanRedirect(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if minimum display time has passed and auth is loaded
    if (canRedirect && !loading && user) {
      // Show toast before redirecting
      if (!toastShown.current) {
        toast({
          title: "Successfully signed in!",
          description: "Welcome back to CebuFlexi Tours!",
          duration: 2000,
        });
        toastShown.current = true;
      }
      // Small delay to let toast appear, then redirect
      setTimeout(() => {
        router.push("/");
      }, 100);
    } else if (canRedirect && !loading && !user) {
      // If user is not authenticated, redirect without toast
      router.push("/");
    }
  }, [canRedirect, loading, user, router, toast]);

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

