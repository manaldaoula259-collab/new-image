import PrivacyPage from "@/components/pages/PrivacyPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MyDzine",
};

export const dynamic = "force-dynamic";

const Privacy = async () => {
  return <PrivacyPage />;
};

export default Privacy;

