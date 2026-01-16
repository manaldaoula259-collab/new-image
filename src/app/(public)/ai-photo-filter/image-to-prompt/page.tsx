import ImageToPromptPage from "@/components/pages/ImageToPromptPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Image-to-Prompt Generator | MyDzine",
  description:
    "Upload a reference image and instantly generate a high-quality, ready-to-use text prompt for diffusion models and creative workflows.",
};

const ImageToPrompt = () => {
  return <ImageToPromptPage />;
};

export default ImageToPrompt;
