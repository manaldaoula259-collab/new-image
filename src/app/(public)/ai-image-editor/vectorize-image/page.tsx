import VectorizeImagePage from "@/components/pages/VectorizeImagePage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Vectorize Image - Convert to SVG | MyDzine",
  description:
    "Vectorize images into flawless, scalable SVGs. Convert any image to vector format ready to conquer any design challenge!",
};

const VectorizeImage = () => {
  return <VectorizeImagePage />;
};

export default VectorizeImage;

