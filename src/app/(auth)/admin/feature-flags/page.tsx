import AdminFeatureFlagsPage from "@/components/pages/admin/AdminFeatureFlagsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Feature Flags",
};

const FeatureFlagsPage = () => <AdminFeatureFlagsPage />;

export default FeatureFlagsPage;
