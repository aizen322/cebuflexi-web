import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { ContentDataProvider } from "@/contexts/ContentDataContext";
import { RootLayout } from "@/components/Layout/RootLayout";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function GlobalSpinner() {
  const { loading } = useAuth();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the page's getLayout if available, otherwise use the default RootLayout
  const getLayout = Component.getLayout ?? ((page) => <RootLayout>{page}</RootLayout>);

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ContentDataProvider>
          <style jsx global>{`
            html {
              font-family: ${inter.style.fontFamily};
            }
          `}</style>
          <GlobalSpinner />
          {getLayout(<Component {...pageProps} />)}
        </ContentDataProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
