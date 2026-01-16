import Converter2DTo3DPage from "@/components/pages/Converter2DTo3DPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "2D to 3D Converter - Transform Images into 3D Models | MyDzine",
  description:
    "Convert your 2D images into stunning 3D models with advanced depth mapping and AI-powered conversion technology. Export in GLB, OBJ, or STL formats.",
};

const Converter2DTo3D = () => {
  return <Converter2DTo3DPage />;
};

export default Converter2DTo3D;
