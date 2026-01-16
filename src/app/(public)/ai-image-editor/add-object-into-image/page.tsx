import AddObjectIntoImagePage from "@/components/pages/AddObjectIntoImagePage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";




export const metadata: Metadata = {
  title: "Add Object into Image - AI Image Editor | MyDzine",
  description:
    "Effortlessly tweak and insert objects in your images with AI-powered editing. Designed for all skill levels to unlock creative potential in seconds!",
};

const AddObjectIntoImage = () => {
  return <AddObjectIntoImagePage />;
};

export default AddObjectIntoImage;

