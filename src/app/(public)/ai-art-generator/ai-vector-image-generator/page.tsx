import AIVectorImageGeneratorPage from "@/components/pages/AIVectorImageGeneratorPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Vector Image Generator | poweraitool",
  description:
    "poweraitool's AI Vector Generator lets you instantly generate and customize crisp, scalable vectors—perfect for all your creative adventures!",
};

const AIVectorImageGenerator = () => {
  return <AIVectorImageGeneratorPage />;
};

export default AIVectorImageGenerator;

