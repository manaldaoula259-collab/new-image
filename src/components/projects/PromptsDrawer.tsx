import { prompts } from "@/core/utils/prompts";
import useProjectContext from "@/hooks/use-project-context";
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { FaMagic } from "react-icons/fa";

const PromptsDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { promptInputRef } = useProjectContext();

  return (
    <>
      <Button
        rightIcon={<FaMagic />}
        variant="ghostOnDark"
        border="1px solid var(--border-subtle)"
        size="sm"
        onClick={onOpen}
      >
        Prompt Assistant
      </Button>
      <Drawer
        isOpen={isOpen}
        size={{ base: "md", md: "lg" }}
        placement="right"
        onClose={onClose}
      >
        <DrawerOverlay backdropFilter="blur(10px)" />
        <DrawerContent
          bg="var(--bg-surface)"
          borderLeft="1px solid var(--border-subtle)"
          boxShadow="-40px 0 90px rgba(8, 14, 26, 0.6)"
        >
          <DrawerCloseButton color="var(--text-primary)" />
          <DrawerHeader borderBottom="1px solid var(--border-subtle)">
            Prompt Assistant
          </DrawerHeader>
          <DrawerBody>
            <VStack
              alignItems="flex-start"
              width="100%"
              divider={<Divider borderColor="rgba(148, 163, 184, 0.12)" />}
              spacing={6}
            >
              <Box>
                <Text mb={4} color="var(--text-muted)">
                  Select a preset
                </Text>
                <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                  {prompts.map((prompt) => (
                    <Box
                      cursor="pointer"
                      key={prompt.slug}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{
                        transform: "translateY(-4px)",
                        filter: "contrast(130%)",
                      }}
                    >
                      <Image
                        onClick={() => {
                          promptInputRef.current!.value = prompt.label;
                          onClose();
                        }}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                        }}
                        src={`/prompts/sacha/${prompt.slug}.png`}
                        alt={prompt.label}
                        width="400"
                        height="400"
                        unoptimized
                      />
                      <Text
                        textTransform="capitalize"
                        fontWeight="semibold"
                        color="var(--text-muted)"
                        mt={1}
                      >
                        {prompt.label}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PromptsDrawer;
