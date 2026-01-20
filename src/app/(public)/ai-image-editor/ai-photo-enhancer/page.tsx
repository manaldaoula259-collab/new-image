import AIPhotoEnhancerPage from "@/components/pages/AIPhotoEnhancerPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Photo Enhancer - Enhance Photo Quality | poweraitool",
  description:
    "Automatically enhance photo resolution, sharpen details, and enhance the quality and aesthetic appeal of photos.",
};

const AIPhotoEnhancer = () => {
  return <AIPhotoEnhancerPage />;
};

export default AIPhotoEnhancer;

