import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <>
      <Head>
        <title>Access Denied - CebuFlexi Tours</title>
        <meta name="description" content="You don't have permission to access this page" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-4">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Access Denied
            </h1>
            
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              You don't have permission to access this page.
            </p>
            
            <p className="text-gray-500 mb-8 text-xs sm:text-sm">
              This area is restricted to administrators only.
            </p>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                <Link href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="mt-6 text-xs text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </>
  );
}

