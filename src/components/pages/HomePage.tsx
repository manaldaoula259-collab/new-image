"use client";

import { Box } from "@chakra-ui/react";
import HeroNew from "../home/HeroNew";
import StatsSection from "../home/StatsSection";
import ToolsIntroSection from "../home/ToolsIntroSection";
import FeatureSection from "../home/FeatureSection";
import HowItWorksSection from "../home/HowItWorksSection";
import ToolsCarousel from "../home/ToolsCarousel";
import PricingSectionNew from "../home/PricingSectionNew";
import FAQSection from "../home/FAQSection";
import CTASection from "../home/CTASection";
import FooterNew from "../home/FooterNew";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const { openSignIn } = useAuthModal();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleCtaClick = (href: string, dashboardHref?: string) => {
    if (isSignedIn) {
      router.push(dashboardHref || href);
    } else {
      openSignIn();
    }
  };

  return (
    <Box bg="#FCFCFC" minH="100vh" mt={0} pt={0}>
      <HeroNew />
      <StatsSection />
      <ToolsIntroSection />

      {/* AI Photo Filters Section */}
      <FeatureSection
        badge="IMAGE CREATION"
        title="AI Photo Filters"
        features={[
          "Image-to-Prompt Generator",
          "AI Style Transfer",
          "AI Anime Filter",
          "2D to 3D Converter",
          "Turn Sketch to Art",
          "AI Design Sketch",
        ]}
        ctaText="GENERATE YOUR FIRST PHOTO"
        ctaHref="/ai-photo-filter"
        onClick={() => handleCtaClick("/ai-photo-filter", "/dashboard/ai-tools")}
        mediaType="image"
        mediaSrc="/assets/landing_page/tools-major-cards/card1_img.png"
        gradientDirection="left"
        backgroundImage="/assets/landing_page/tools-major-cards/card_1.png"
        reverse={true}
      />

      {/* AI Image Editors Section */}
      <FeatureSection
        badge="IMAGE CREATION"
        title="AI Image Editors"
        features={[
          "Remove Background",
          "Remove Object from Image",
          "Add Object into Image",
          "Insert Objects",
          "AI Photo Enhancer",
          "AI Photo Expand",
          "Vectorize Image",
          "AI Combine Image",
        ]}
        ctaText="EDIT YOUR IMAGE"
        ctaHref="/ai-image-editor"
        onClick={() => handleCtaClick("/ai-image-editor", "/dashboard/ai-tools")}
        mediaType="image"
        mediaSrc="/assets/landing_page/tools-major-cards/feature-card-2-v.svg"
        reverse={false}
        gradientDirection="right"
        backgroundImage="/assets/landing_page/tools-major-cards/card_2.png"
        svgVideoOverlay5="/assets/landing_page/tools-major-cards/secondfeature-card-1.mp4"
        svgVideoOverlay6="/assets/landing_page/tools-major-cards/secondfeature-card-2.webm"
      />

      {/* AI Art Generators Section */}
      <FeatureSection
        badge="IMAGE CREATION"
        title="AI Art Generators"
        features={[
          "AI Character Generator",
          "AI Anime Generator",
          "AI Comic Generator",
          "AI Coloring Book Generator",
          "AI Vector Image Generator",
        ]}
        ctaText="GENERATE YOUR PHOTO"
        ctaHref="/ai-art-generator"
        onClick={() => handleCtaClick("/ai-art-generator", "/dashboard/ai-tools")}
        mediaType="image"
        mediaSrc="/assets/landing_page/tools-major-cards/card3_img.png"
        gradientDirection="left"
        backgroundImage="/assets/landing_page/tools-major-cards/card_3.png"
        reverse={true}
      />

      <HowItWorksSection />
      <ToolsCarousel />
      <PricingSectionNew />
      <FAQSection />
      <CTASection />
      <FooterNew />
    </Box>
  );
};

export default HomePage;
