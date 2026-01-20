import RemoveObjectFromImagePage from "@/components/pages/RemoveObjectFromImagePage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Remove Object from Image - AI Image Editor | poweraitool",
  description:
    "Effortlessly remove unwanted objects from your images with AI-powered editing. Designed for all skill levels to unlock creative potential in seconds!",
};

const RemoveObjectFromImage = () => {
  return <RemoveObjectFromImagePage />;
};

export default RemoveObjectFromImage;

