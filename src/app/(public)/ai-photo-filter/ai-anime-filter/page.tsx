import AIAnimeFilterPage from "@/components/pages/AIAnimeFilterPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Anime Filter Studio | MyDzine",
  description:
    "Turn selfies and photos into vibrant anime-style illustrations in seconds. Perfect for avatars, posters, and social content.",
};

const AIAnimeFilter = () => {
  return <AIAnimeFilterPage />;
};

export default AIAnimeFilter;
