import InsertObjectsPage from "@/components/pages/InsertObjectsPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Insert Objects - Add Objects to Photos | MyDzine",
  description:
    "Add objects to your photos using visual references. Create more dynamic and personalized images with AI-powered object insertion.",
};

const InsertObjects = () => {
  return <InsertObjectsPage />;
};

export default InsertObjects;

