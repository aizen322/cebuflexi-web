import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { SignInDialog } from "@/components/Auth/SignInDialog";
import { SignUpDialog } from "@/components/Auth/SignUpDialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSignInOpen(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const redirect = (router.query.redirect as string) || "/";
      router.push(redirect);
    }
  }, [user, loading, router]);

  const handleSwitchToSignUp = () => {
    setSignInOpen(false);
    setSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setSignUpOpen(false);
    setSignInOpen(true);
  };

  const handleSignInSuccess = () => {
    const redirect = (router.query.redirect as string) || "/";
    router.push(redirect);
  };

  if (!mounted || loading) {
    return (
      <>
        <Head>
          <title>Sign In - CebuFlexi Tours</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Head>
        <title>Sign In - CebuFlexi Tours</title>
        <meta name="description" content="Sign in to your CebuFlexi Tours account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your adventure</p>
          </div>
          <SignInDialog
            open={signInOpen}
            onOpenChange={setSignInOpen}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
          <SignUpDialog
            open={signUpOpen}
            onOpenChange={setSignUpOpen}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        </div>
      </div>
    </>
  );
}

