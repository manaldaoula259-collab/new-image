import DashboardToolRouterPage from "@/components/pages/DashboardToolRouterPage";
import { dashboardTools } from "@/data/dashboard";
import type { Metadata } from "next";

type Props = {
  params: { slug?: string[] };
};

export function generateMetadata({ params }: Props): Metadata {
  const slugPath = (params.slug || []).join("/");
  const normalized = slugPath.replace(/^\/+/, "");
  const tool = dashboardTools.find((t) => {
    const s = t.href.replace("/dashboard/tools/", "").replace(/^\/+/, "");
    return s === normalized;
  });

  return {
    title: tool?.title ? `${tool.title} | Dashboard Tools` : "Tool | Dashboard",
    description: tool?.description || "Create with AI tools inside your dashboard.",
  };
}

export default function DashboardToolDynamicPage({ params }: Props) {
  const slugPath = (params.slug || []).join("/");
  return <DashboardToolRouterPage slugPath={slugPath} />;
}


