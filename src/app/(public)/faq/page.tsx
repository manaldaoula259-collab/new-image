import FaqPage from "@/components/pages/FaqPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function Faq() {
  return <FaqPage />;
}
