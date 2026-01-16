import DashboardToolRouterPage from "@/components/pages/DashboardToolRouterPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert to Studio Ghibli | Dashboard Tools",
  description:
    "Transform your photos into magical Studio Ghibli anime style artwork with AI — inside your dashboard.",
};

export default function StudioGhibliPage() {
  return <DashboardToolRouterPage slugPath="studio-ghibli" />;
}

