import AIStyleTransferPage from "@/components/pages/AIStyleTransferPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Style Transfer Studio | poweraitool",
  description:
    "Apply painterly, cyberpunk, watercolor, and more artistic styles to any photo in seconds with AI-powered style transfer.",
};

const AIStyleTransfer = () => {
  return <AIStyleTransferPage />;
};

export default AIStyleTransfer;
