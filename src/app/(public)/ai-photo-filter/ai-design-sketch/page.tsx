import AIDesignSketchPage from "@/components/pages/AIDesignSketchPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "AI Design Sketch Generator - Transform Photos into Artistic Sketches | MyDzine",
  description:
    "Transform any photo into beautiful hand-drawn sketches with AI precision. Perfect for artistic designs and creative projects. Generate sketches instantly.",
};

const AIDesignSketch = () => {
  return <AIDesignSketchPage />;
};

export default AIDesignSketch;
