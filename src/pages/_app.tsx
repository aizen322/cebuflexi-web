import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentDataProvider } from "@/contexts/ContentDataContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ContentDataProvider>
        <Component {...pageProps} />
        <Toaster />
      </ContentDataProvider>
    </AuthProvider>
  );
}
