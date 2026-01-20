import AIColoringBookGeneratorPage from "@/components/pages/AIColoringBookGeneratorPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";




export const metadata: Metadata = {
  title: "AI Coloring Book Generator | poweraitool",
  description:
    "Upload photos or enter text to create any coloring page you (or your child) can imagine with poweraitool AI coloring book generator. Now, transform your ideas into coloring books with just a few clicks.",
};

const AIColoringBookGenerator = () => {
  return <AIColoringBookGeneratorPage />;
};

export default AIColoringBookGenerator;

