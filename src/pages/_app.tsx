import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ContentDataProvider } from "@/contexts/ContentDataContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Loader2 } from "lucide-react";

function AppWithAuth({ Component, pageProps }: AppProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ContentDataProvider>
        <AppWithAuth Component={Component} pageProps={pageProps} />
      </ContentDataProvider>
    </AuthProvider>
  );
}
