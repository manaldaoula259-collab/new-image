"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { dashboardPricingPlans } from "@/data/dashboard";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  useToast,
  VStack,
  HStack,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiCheck, FiZap } from "react-icons/fi";

const DashboardPricingPage = () => {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const sessionId = searchParams?.get("session_id");
  const success = searchParams?.get("success");
  const canceled = searchParams?.get("canceled");
  const processedSessionRef = useRef<Set<string>>(new Set());
  const successShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const verifyPayment = async () => {
      if (!success || !sessionId || processedSessionRef.current.has(sessionId)) {
        return;
      }

      processedSessionRef.current.add(sessionId);
      setIsVerifying(true);
      window.history.replaceState({}, "", "/dashboard/pricing");

      try {
        const response = await axios.get(
          `/api/checkout/check/credits?session_id=${sessionId}`
        );

        if (response.data.success && !successShownRef.current.has(sessionId)) {
          successShownRef.current.add(sessionId);
          toast({
            title: "Payment Successful!",
            description: `You now have ${response.data.credits.toLocaleString()} credits.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            id: `payment-success-${sessionId}`,
          });
          if (typeof window !== "undefined" && (window as any).refetchUserCredits) {
            (window as any).refetchUserCredits();
          }
          setIsVerifying(false);
        } else if (!response.data.success) {
          let pollCount = 0;
          const maxPolls = 15;
          
          pollInterval = setInterval(async () => {
            pollCount++;
            try {
              const pollResponse = await axios.get(
                `/api/checkout/check/credits?session_id=${sessionId}`
              );
              
              if (pollResponse.data.success && !successShownRef.current.has(sessionId)) {
                if (pollInterval) clearInterval(pollInterval);
                successShownRef.current.add(sessionId);
                toast({
                  title: "Payment Successful!",
                  description: `You now have ${pollResponse.data.credits.toLocaleString()} credits.`,
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                  id: `payment-success-${sessionId}`,
                });
                if (typeof window !== "undefined" && (window as any).refetchUserCredits) {
                  (window as any).refetchUserCredits();
                }
                setIsVerifying(false);
              } else if (pollCount >= maxPolls) {
                if (pollInterval) clearInterval(pollInterval);
                toast({
                  title: "Payment Processing",
                  description: "Your payment is being processed. Credits will be added shortly.",
                  status: "info",
                  duration: 10000,
                  isClosable: true,
                  id: `payment-processing-${sessionId}`,
                });
                setIsVerifying(false);
              }
            } catch (error) {
              if (pollCount >= maxPolls) {
                if (pollInterval) clearInterval(pollInterval);
                setIsVerifying(false);
              }
            }
          }, 2000);
        }
      } catch (error) {
        toast({
          title: "Payment Verification",
          description: "Your payment is being processed. Credits will be added shortly.",
          status: "info",
          duration: 5000,
          isClosable: true,
          id: `payment-verification-${sessionId}`,
        });
        setIsVerifying(false);
      }
    };

    if (success === "true" && sessionId) {
      verifyPayment();
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, sessionId]);

  useEffect(() => {
    if (canceled === "true") {
      window.history.replaceState({}, "", "/dashboard/pricing");
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        status: "info",
        duration: 3000,
        isClosable: true,
        id: "payment-canceled",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canceled]);
  
  return (
    <DashboardShell activeItem="pricing">
      {/* Page Header */}
      <Box mb={{ base: 8, md: 10 }} textAlign="center" maxW="700px" mx="auto">
        <Heading
          as="h1"
          fontSize={{ base: "28px", md: "36px", lg: "40px" }}
          fontWeight="600"
          color="black"
          letterSpacing="-0.02em"
          mb={4}
          fontFamily="'General Sans', 'Inter', sans-serif"
        >
          Choose Your Plan
        </Heading>
        <Text 
          fontSize={{ base: "14px", md: "16px" }} 
          color="#71717A" 
          lineHeight="1.7" 
          fontFamily="'General Sans', 'Inter', sans-serif"
        >
          Get credits to power your AI image generation, editing, and creative automation. Credits never expire.
        </Text>
      </Box>

      {isVerifying && (
        <Alert 
          status="info" 
          mb={6} 
          borderRadius="14px"
          bg="#FAFAFA"
          border="1px solid #F0F0F0"
        >
          <AlertIcon color="#71717A" />
          <Box>
            <AlertTitle color="black" fontWeight="500" fontSize="14px" fontFamily="'General Sans', 'Inter', sans-serif">
              Verifying Payment...
            </AlertTitle>
            <AlertDescription color="#A1A1AA" fontSize="13px" fontFamily="'General Sans', 'Inter', sans-serif">
              Please wait while we verify your payment and add credits to your account.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, md: 6 }} maxW="1200px" mx="auto" mb={8}>
        {dashboardPricingPlans.map((plan) => (
          <Box
            key={plan.name}
            bg="white"
            borderRadius={{ base: "18px", md: "22px" }}
            border={plan.highlight ? "2px solid black" : "1px solid #E5E5E5"}
            overflow="hidden"
            position="relative"
            transition="all 0.25s ease"
            display="flex"
            flexDirection="column"
            h="100%"
            _hover={{
              transform: "translateY(-6px)",
              borderColor: plan.highlight ? "black" : "#6366f1",
              boxShadow: plan.highlight 
                ? "0 16px 40px rgba(0, 0, 0, 0.18)" 
                : "0 16px 40px rgba(99, 102, 241, 0.18)",
            }}
          >
            {plan.highlight && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bg="black"
                py={3}
                textAlign="center"
                zIndex={1}
              >
                <Text 
                  fontSize="11px" 
                  fontWeight="600" 
                  color="white" 
                  textTransform="uppercase" 
                  letterSpacing="1.2px" 
                  fontFamily="'IBM Plex Mono', monospace"
                >
                  Most Popular
                </Text>
              </Box>
            )}

            <VStack 
              spacing={0} 
              p={{ base: 6, md: 8 }} 
              pt={plan.highlight ? { base: 12, md: 14 } : { base: 6, md: 8 }} 
              align="stretch"
              h="100%"
              display="flex"
              flexDirection="column"
            >
              {/* Plan Name & Description */}
              <Box mb={6}>
                <Text 
                  fontSize={{ base: "20px", md: "22px" }} 
                  fontWeight="600" 
                  color="black" 
                  mb={2.5}
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  {plan.name}
                </Text>
                <Text 
                  fontSize="14px" 
                  color="#71717A" 
                  lineHeight="1.6"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  {plan.description}
                </Text>
              </Box>

              {/* Price Section */}
              <Box mb={6}>
                <Flex align="baseline" mb={1.5}>
                  <Text 
                    fontSize={{ base: "40px", md: "48px" }} 
                    fontWeight="700" 
                    color="black" 
                    lineHeight="1" 
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    {plan.price}
                  </Text>
                </Flex>
                <Text 
                  fontSize="14px" 
                  color="#71717A" 
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  {plan.pricePerCredit}
                </Text>
              </Box>

              {/* Credits Display - Clean Professional Design */}
              <Box
                w="100%"
                mb={6}
                py={5}
                px={4}
                bg={plan.highlight ? "rgba(99, 102, 241, 0.04)" : "#FAFAFA"}
                borderRadius="12px"
                border={plan.highlight ? "1px solid rgba(99, 102, 241, 0.15)" : "1px solid #F0F0F0"}
              >
                <VStack spacing={3} align="center">
                  <HStack spacing={3} align="center">
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="12px"
                      bg={plan.highlight ? "#6366f1" : "#6366f1"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow={plan.highlight ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "0 2px 8px rgba(99, 102, 241, 0.15)"}
                    >
                      <Icon 
                        as={FiZap} 
                        color="white"
                        fontSize="22px" 
                      />
                    </Box>
                    <VStack spacing={0} align="flex-start">
                      <Text 
                        fontSize={{ base: "34px", md: "38px" }} 
                        fontWeight="700" 
                        color="black"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        lineHeight="1"
                        letterSpacing="-0.5px"
                      >
                        {plan.credits.toLocaleString()}
                      </Text>
                      <Text 
                        fontSize="11px" 
                        color="#71717A" 
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.8px"
                        mt={0.5}
                      >
                        Credits Included
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Features List */}
              <VStack spacing={3.5} w="100%" align="stretch" mb={8} flex="1">
                <HStack spacing={3} align="flex-start">
                  <Icon as={FiCheck} fontSize="16px" color="#16A34A" flexShrink={0} mt={0.5} />
                  <Text 
                    fontSize="14px" 
                    color="#52525B" 
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    lineHeight="1.6"
                  >
                    {plan.promptCredits.toLocaleString()} prompt wizard credits
                  </Text>
                </HStack>
                <HStack spacing={3} align="flex-start">
                  <Icon as={FiCheck} fontSize="16px" color="#16A34A" flexShrink={0} mt={0.5} />
                  <Text 
                    fontSize="14px" 
                    color="#52525B" 
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    lineHeight="1.6"
                  >
                    Credits never expire
                  </Text>
                </HStack>
                <HStack spacing={3} align="flex-start">
                  <Icon as={FiCheck} fontSize="16px" color="#16A34A" flexShrink={0} mt={0.5} />
                  <Text 
                    fontSize="14px" 
                    color="#52525B" 
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    lineHeight="1.6"
                  >
                    Access all AI tools
                  </Text>
                </HStack>
              </VStack>

              {/* CTA Button */}
              <Box mt="auto" textAlign="center">
                <Box
                  as={Link}
                  href={plan.ctaHref}
                  display="inline-flex"
                  role="group"
                >
                  <Button
                    width="auto"
                    minW="auto"
                    height={{ base: "56px", md: "72px" }}
                    bg="black"
                    color="white"
                    px={0}
                    borderRadius="8px"
                    fontFamily="'IBM Plex Mono', monospace"
                    fontWeight="500"
                    fontSize={{ base: "13px", md: "15px" }}
                    letterSpacing="0.6px"
                    textTransform="uppercase"
                    display="flex"
                    alignItems="center"
                    gap={0}
                    overflow="hidden"
                    position="relative"
                    _hover={{
                      bg: "#1a1a1a",
                    }}
                    _active={{
                      bg: "#1a1a1a",
                    }}
                  >
                    <Box
                      position="absolute"
                      left={{ base: "4px", md: "4px" }}
                      top={{ base: "4px", md: "4px" }}
                      bottom={{ base: "4px", md: "4px" }}
                      bg="#573cff"
                      borderRadius="4px"
                      w={{ base: "48px", md: "64px" }}
                      transition="width 0.3s ease, border-radius 0.3s ease"
                      _groupHover={{
                        w: "calc(100% - 8px)",
                        borderRadius: "4px",
                      }}
                    />
                    <Box
                      position="absolute"
                      left={{ base: "28px", md: "36px" }}
                      top="50%"
                      transform="translate(-50%, -50%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={2}
                    >
                      <Image
                        src="/assets/landing_page/btn_arrow.svg"
                        alt="Arrow"
                        width={20}
                        height={20}
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    </Box>
                    <Text 
                      pl={{ base: "60px", md: "80px" }}
                      pr={{ base: 4, md: 6 }} 
                      py={{ base: 3, md: 4 }}
                      position="relative"
                      zIndex={1}
                      transition="color 0.3s ease"
                      _groupHover={{
                        color: "white",
                      }}
                    >
                      {plan.ctaLabel}
                    </Text>
                  </Button>
                </Box>
              </Box>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Flex 
        justify="center" 
        mt={{ base: 6, md: 8 }} 
        gap={{ base: 4, md: 6 }} 
        flexWrap="wrap"
      >
        <HStack spacing={2} color="#A1A1AA" fontSize="12px" fontFamily="'General Sans', 'Inter', sans-serif">
          <Icon as={FiCheck} color="#A1A1AA" fontSize="14px" />
          <Text>Secure payment</Text>
        </HStack>
        <HStack spacing={2} color="#A1A1AA" fontSize="12px" fontFamily="'General Sans', 'Inter', sans-serif">
          <Icon as={FiCheck} color="#A1A1AA" fontSize="14px" />
          <Text>Instant access</Text>
        </HStack>
        <HStack spacing={2} color="#A1A1AA" fontSize="12px" fontFamily="'General Sans', 'Inter', sans-serif">
          <Icon as={FiCheck} color="#A1A1AA" fontSize="14px" />
          <Text>Cancel anytime</Text>
        </HStack>
      </Flex>
    </DashboardShell>
  );
};

export default DashboardPricingPage;
