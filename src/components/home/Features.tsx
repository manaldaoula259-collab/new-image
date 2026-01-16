import { Flex, Image, SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";

interface ItemProps {
  iconName: string;
  title: string;
  children: React.ReactNode;
}

const Item = ({ iconName, title, children }: ItemProps) => (
  <Flex
    alignItems="center"
    direction="column"
    p={6}
    gap={2}
    background="var(--bg-surfaceMuted)"
    border="1px solid var(--border-subtle)"
    borderRadius="2xl"
    backdropFilter="blur(16px)"
    boxShadow="0 20px 45px rgba(8, 14, 26, 0.5)"
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    _hover={{
      transform: "translateY(-6px)",
      borderColor: "var(--border-emphasis)",
      boxShadow: "0 28px 70px rgba(14, 22, 36, 0.65)",
    }}
  >
    <Image alt="logo" width="5rem" src={iconName} />
    <Text
      textAlign="center"
      fontWeight="900"
      fontSize="clamp(1.4rem, 1vw + 1.2rem, 1.8rem)"
      mt={3}
    >
      {title}
    </Text>
    <Text
      maxWidth={{ base: "20rem", lg: "13rem" }}
      mt={2}
      textAlign="center"
      fontSize="clamp(1rem, 0.6vw + 0.8rem, 1.1rem)"
      color="var(--text-muted)"
    >
      {children}
    </Text>
  </Flex>
);

const Features = () => {
  return (
    <Flex
      width="100%"
      py={16}
      flex="1"
      bg="var(--bg-canvas)"
      borderTop="1px solid var(--border-subtle)"
      borderBottom="1px solid var(--border-subtle)"
    >
      <Flex
        px={{ base: 4, lg: 0 }}
        py={6}
        width="100%"
        flexDirection="column"
        margin="auto"
        maxWidth="container.lg"
      >
        <SimpleGrid mb={10} columns={{ base: 1, md: 3 }}>
          <Item iconName="publish.svg" title="1. Upload">
            Upload <b>some selfies</b> of you (or other person) with different
            angles
          </Item>
          <Item iconName="square.svg" title="2. Wait">
            Take a coffee break while we build <b>your studio</b> based on your photos
          </Item>
          <Item iconName="preview.svg" title="3. Prompt">
            Use your imagination to craft the <b>perfect prompt!</b>
          </Item>
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default Features;
