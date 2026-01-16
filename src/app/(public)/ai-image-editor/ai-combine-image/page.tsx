import AICombineImagePage from "@/components/pages/AICombineImagePage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";




export const metadata: Metadata = {
  title: "AI Combine Image - Merge Images Seamlessly | MyDzine",
  description:
    "Merge images and layers with AI-powered editing. Achieve seamless structural match and consistent styling in just a few clicks.",
};

const AICombineImage = () => {
  return <AICombineImagePage />;
};

export default AICombineImage;

