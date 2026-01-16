import AIComicGeneratorPage from "@/components/pages/AIComicGeneratorPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Comic Generator | MyDzine",
  description:
    "Choose your favorite comic style and within seconds, you'll have AI-generated comic.",
};

const AIComicGenerator = () => {
  return <AIComicGeneratorPage />;
};

export default AIComicGenerator;

