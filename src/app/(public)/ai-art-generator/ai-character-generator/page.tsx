import AICharacterGeneratorPage from "@/components/pages/AICharacterGeneratorPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Character Generator | MyDzine",
  description:
    "Convert text to images in seconds with Dzine's free AI character generator. It also helps you create unique characters from pictures of people, animals, toys, or fantastical beings - no ads or watermarks.",
};

const AICharacterGenerator = () => {
  return <AICharacterGeneratorPage />;
};

export default AICharacterGenerator;

