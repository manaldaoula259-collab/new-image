import TurnSketchToArtPage from "@/components/pages/TurnSketchToArtPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Sketch to Art Painter | MyDzine",
  description:
    "Upload line art and let AI paint it with cinematic lighting, color, and texture. Perfect for concept art, comics, and storyboards.",
};

const TurnSketchToArt = () => {
  return <TurnSketchToArtPage />;
};

export default TurnSketchToArt;
