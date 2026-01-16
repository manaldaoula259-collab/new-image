import { prompts } from "@/core/utils/prompts";
import { Box, Flex, Image } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
// @ts-ignore - windups has type resolution issues with package.json exports
import { Pause, WindupChildren } from "windups";
import AvatarsPlaceholder from "./AvatarsPlaceholder";
import urlSlug from "url-slug";

const MotionImage = motion(Image);
const MotionBox = motion(Box);

const Demo = () => {
  const [step, setStep] = useState(0);
  const prompt = prompts[step];
  const names = ["romy", "sacha"] as const;
  const index = Math.random() >= 0.5 ? 1 : 0;

  return (
    <Box ml={{ base: 0, lg: 10 }} width="100%">
      <Box
        width="100%"
        marginX="auto"
        fontSize="clamp(1rem, 1.4vw, 1.1rem)"
        boxShadow="0 30px 60px -40px rgba(15, 23, 42, 0.85)"
        borderRadius="xl"
        py={3}
        px={4}
        backgroundColor="var(--bg-glass)"
        border="1px solid var(--border-subtle)"
        backdropFilter="blur(18px)"
      >
        <WindupChildren
          onFinished={() => {
            setStep(step === prompts.length - 1 ? 0 : step + 1);
          }}
        >
          {prompt.prompt.split(",")[0]}
          <Pause ms={4000} />
        </WindupChildren>
        <MotionBox
          borderRight="1px"
          borderColor="var(--border-emphasis)"
          as="span"
          bg="var(--accent)"
          ml={1}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
      </Box>
      <Flex justifyContent="space-between" mt={6} pr={6}>
        <Box width="100%" position="relative" ml={10}>
          <AvatarsPlaceholder character={names[index]} />
        </Box>
        <AnimatePresence mode="wait">
          <MotionImage
            key={prompt.label}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ delay: 0.2 }}
            shadow="0 24px 45px rgba(15, 23, 42, 0.65)"
            borderRadius="3xl"
            width="14rem"
            height="14rem"
            border="1px solid var(--border-subtle)"
            zIndex={10}
            alt={prompt.label}
            src={`/prompts/${names[index]}/${urlSlug(prompt.label, {
              separator: "-",
            })}.png`}
          />
        </AnimatePresence>
      </Flex>
    </Box>
  );
};

export default Demo;
