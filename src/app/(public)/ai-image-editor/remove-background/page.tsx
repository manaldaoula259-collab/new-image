import RemoveBackgroundPage from "@/components/pages/RemoveBackgroundPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Remove Background - AI Image Editor | MyDzine",
  description:
    "Erase backgrounds with a simple tap. Remove backgrounds from your images instantly with AI-powered editing.",
};

const RemoveBackground = () => {
  return <RemoveBackgroundPage />;
};

export default RemoveBackground;

