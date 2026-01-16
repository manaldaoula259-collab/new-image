"use client";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

const faqs = [
  {
    question: 'What can "Image-to-Image" do?',
    answer: 'You can map out the design elements (such as shapes, images, or other visual components) on the canvas in the way you like and then press "Image-to-Image" to merge them into a new image layer.',
  },
  {
    question: "How quickly can I generate assets using Dzine?",
    answer: "Most generations complete within seconds. Complex operations like training custom models may take a few minutes, but standard image generation, editing, and enhancement are nearly instant.",
  },
  {
    question: "Is Dzine suitable for beginners or do I need skills for using AI-assisted image generation tools?",
    answer: "Dzine is designed for users of all skill levels. Our intuitive interface and AI-powered tools make it easy for beginners to create professional-quality images, while advanced users can leverage powerful customization options.",
  },
  {
    question: "Can I use Dzine for free?",
    answer: "Yes! You can start with free credits to explore our tools. When you're ready to scale, choose from our flexible credit packs that fit your needs.",
  },
  {
    question: "Can I use my generated content for commercial purposes?",
    answer: "Absolutely. All content you generate with Dzine is yours to use commercially. You retain full rights to your creations.",
  },
  {
    question: "What are the rules for deducting credits?",
    answer: "Credits are deducted based on the complexity of the operation. Simple edits use fewer credits, while advanced features like model training use more. Check our pricing page for detailed credit costs.",
  },
  {
    question: "Private Generation?",
    answer: "Yes, all your generations are private by default. Your images and prompts are not shared publicly unless you choose to share them.",
  },
  {
    question: "Can others see the images I generate?",
    answer: "No, your generated images are private and only visible to you. We respect your privacy and do not share your content without your explicit permission.",
  },
];

const FAQSection = () => {
  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 16, md: 24 }}
      bg="#fcfcfc"
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        {/* Section Header */}
        <VStack spacing={{ base: 4, md: 6 }} textAlign="center" mb={{ base: 12, md: 16 }}>
          <Heading
            as="h2"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "36px", md: "48px", lg: "60px" }}
            lineHeight={{ base: "1.2", md: "66px" }}
            letterSpacing="-0.6px"
            color="black"
          >
            FAQ
          </Heading>
        </VStack>

        {/* FAQ Accordion */}
        <Accordion allowMultiple defaultIndex={[0]}>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              borderTop="0.8px solid black"
              borderBottom={index === faqs.length - 1 ? "0.8px solid black" : "none"}
              py={4}
            >
              <AccordionButton
                px={0}
                _hover={{ bg: "transparent" }}
                _focus={{ boxShadow: "none" }}
              >
                <Box flex="1" textAlign="left">
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize={{ base: "16px", md: "20px" }}
                    lineHeight="30px"
                    color="black"
                  >
                    {faq.question}
                  </Text>
                </Box>
                <AccordionIcon color="black" />
              </AccordionButton>
              <AccordionPanel px={0} pb={4}>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "16px", md: "20px" }}
                  lineHeight="28px"
                  color="black"
                >
                  {faq.answer}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Box>
  );
};

export default FAQSection;

