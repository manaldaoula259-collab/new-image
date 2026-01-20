import AIPhotoExpandPage from "@/components/pages/AIPhotoExpandPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Photo Expand - Enlarge and Extend Images | poweraitool",
  description:
    "Use AI Image Expander to enlarge images, fill backgrounds, and transform any photo with beautiful extensions.",
};

const AIPhotoExpand = () => {
  return <AIPhotoExpandPage />;
};

export default AIPhotoExpand;

