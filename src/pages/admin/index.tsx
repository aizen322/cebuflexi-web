import { useEffect, ReactElement } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { NextPageWithLayout } from "@/pages/_app";

const AdminIndexPage: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span>Redirecting to dashboard...</span>
      </div>
    </div>
  );
};

AdminIndexPage.getLayout = (page: ReactElement) => page;

export default AdminIndexPage;


