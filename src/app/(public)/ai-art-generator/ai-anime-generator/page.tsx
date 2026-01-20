import AIAnimeGeneratorPage from "@/components/pages/AIAnimeGeneratorPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Anime Generator | MyDzine",
  description:
    "Instantly create exquisite anime style art, bringing a distinctive touch to your images with poweraitool.",
};

const AIAnimeGenerator = () => {
  return <AIAnimeGeneratorPage />;
};

export default AIAnimeGenerator;

