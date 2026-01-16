"use client";

import {
  Box,
  Container,
  Flex,
  Text,
} from "@chakra-ui/react";

const stats = [
  {
    value: "19+",
    label: "AI Tools",
  },
  {
    value: "Multi-Use",
    label: "Design, marketing & branding",
  },
  {
    value: "100%",
    label: "SaaS Ready",
  },
];

const StatsSection = () => {
  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 8, md: 12 }}
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        <Box
          bg="#f0f0f0"
          borderRadius="16px"
          boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
          overflow="hidden"
          py={{ base: 8, md: 12 }}
          px={{ base: 4, md: 8 }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-around"
            align="center"
            gap={{ base: 8, md: 0 }}
            position="relative"
          >
            {stats.map((stat, index) => (
              <Flex
                key={stat.label}
                direction="column"
                align="center"
                textAlign="center"
                flex={1}
                position="relative"
                px={{ base: 4, md: 8 }}
                _after={{
                  content: index < stats.length - 1 ? '""' : "none",
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1px",
                  height: "100%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                  display: { base: "none", md: "block" },
                }}
              >
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "40px", md: "60px" }}
                  lineHeight="60px"
                  letterSpacing="-3px"
                  color="black"
                  mb={2}
                >
                  {stat.value}
                </Text>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "18px", md: "24px" }}
                  lineHeight="31.2px"
                  letterSpacing="-0.24px"
                  color="black"
                  textAlign="center"
                >
                  {stat.label}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsSection;

