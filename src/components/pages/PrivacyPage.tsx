"use client";

import PageContainer from "@/components/layout/PageContainer";
import { Link, List, ListItem, Text, VStack, Box, Container } from "@chakra-ui/react";
import NextImage from "next/image";

const PrivacyPage = () => (
  <Box
    as="section"
    width="100%"
    minHeight="100vh"
    position="relative"
    overflow="visible"
    bg="#fcfcfc"
  >
    {/* Background Image - Fixed Height */}
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      width="100%"
      height="100vh"
      minHeight="100vh"
      zIndex={0}
      pointerEvents="none"
    >
      <NextImage
        src="/assets/landing_page/hero_bg.png"
        alt="Hero Background"
        fill
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        priority
      />
    </Box>

    <PageContainer pb={16} position="relative" zIndex={2}>
      <Container maxW="1400px" px={{ base: 4, md: 8 }}>
        <VStack
          margin="auto"
          maxWidth="container.lg"
          p={{ base: 6, md: 10 }}
          spacing={5}
          bg="#f0f0f0"
          borderRadius="16px"
          width="100%"
          alignItems="flex-start"
          boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
          pt={{ base: 8, md: 12 }}
        >
          <Text
            as="h1"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "36px", md: "48px", lg: "60px" }}
            lineHeight={{ base: "1.2", md: "66px" }}
            letterSpacing="-0.6px"
            color="black"
          >
            Privacy Policy
          </Text>

          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            At MyDzine, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our AI-powered creative platform, or interact with us. MyDzine is a comprehensive AI creative suite offering 100+ tools for image generation, video creation, photo editing, and artistic transformations.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            This policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and was last updated on{" "}
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Information We Collect
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We collect information that you provide directly to us, as well as information that is automatically collected when you use our services.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We may collect personal information that you voluntarily provide to us when you:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Register for an account and authenticate using our authentication service</ListItem>
            <ListItem>Use our AI-powered tools including image generation, video creation, photo editing, style transfer, and artistic transformations</ListItem>
            <ListItem>Upload images, videos, or other content for processing through our AI models</ListItem>
            <ListItem>Purchase credits or subscription plans</ListItem>
            <ListItem>Save generated content to your media library</ListItem>
            <ListItem>Contact us for support or customer service</ListItem>
            <ListItem>Subscribe to our newsletter or marketing communications</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            This information may include:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Name and profile information</ListItem>
            <ListItem>Email address</ListItem>
            <ListItem>Authentication data (managed securely through Clerk authentication service)</ListItem>
            <ListItem>Payment information (processed securely through Stripe and other third-party payment processors)</ListItem>
            <ListItem>Images, videos, and content you upload for AI processing</ListItem>
            <ListItem>Generated AI content (images, videos, prompts) saved to your media library</ListItem>
            <ListItem>Usage data including credits consumed, tools used, and generation history</ListItem>
            <ListItem>Prompts and instructions you provide to AI models</ListItem>
          </List>

          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Automatically Collected Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            When you visit our website, we may automatically collect certain information about your device, including:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Internet Protocol (IP) address</ListItem>
            <ListItem>Browser type and version</ListItem>
            <ListItem>Pages you visit and time spent on each page</ListItem>
            <ListItem>Date and time of your visit</ListItem>
            <ListItem>Referring website addresses</ListItem>
            <ListItem>Device information and operating system</ListItem>
          </List>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            How We Use Your Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We use the information we collect to:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Provide, maintain, and improve our AI-powered creative platform and 100+ tools</ListItem>
            <ListItem>Process your uploaded content through AI models (Replicate, OpenAI, and other providers) to generate images, videos, and artistic transformations</ListItem>
            <ListItem>Manage your account, credits, and subscription plans</ListItem>
            <ListItem>Store and organize your generated content in your media library</ListItem>
            <ListItem>Process transactions and send related information</ListItem>
            <ListItem>Send you technical notices, updates, and support messages</ListItem>
            <ListItem>Respond to your comments, questions, and requests</ListItem>
            <ListItem>Monitor and analyze trends, usage patterns, and tool performance</ListItem>
            <ListItem>Detect, prevent, and address technical issues, security threats, and abuse</ListItem>
            <ListItem>Personalize your experience and recommend relevant tools</ListItem>
            <ListItem>Send you marketing communications (with your consent)</ListItem>
          </List>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Data Storage and Security
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Your uploaded images, videos, and generated AI content are stored securely on AWS S3 and our cloud infrastructure. We use industry-standard encryption (SSL/TLS) for data in transit and at rest, and implement access controls to protect your data. Your media library content is private to your account and is not shared with other users unless you explicitly choose to share it.
          </Text>


          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Cookies and Tracking Technologies
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Your Rights
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>The right to access your personal information</ListItem>
            <ListItem>The right to correct inaccurate information</ListItem>
            <ListItem>The right to delete your personal information</ListItem>
            <ListItem>The right to object to processing of your personal information</ListItem>
            <ListItem>The right to data portability</ListItem>
            <ListItem>The right to withdraw consent</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            To exercise these rights, please contact us using the information provided in the Contact Us section below.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            AI-Generated Content and Intellectual Property
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            When you use MyDzine&apos;s AI tools to generate images, videos, or other content, you retain ownership of the generated content. However, you are responsible for ensuring that:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>You have the right to use any uploaded images or content as input for AI processing</ListItem>
            <ListItem>Generated content does not infringe on the rights of others, including copyright, trademark, or privacy rights</ListItem>
            <ListItem>You comply with applicable laws and regulations when using generated content</ListItem>
            <ListItem>You do not use the service to generate harmful, illegal, or prohibited content</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            We reserve the right to review, moderate, and remove content that violates our terms of service or applicable laws. We may use automated systems and human review to detect and prevent abuse.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Data Retention
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Your uploaded images, generated content, and media library items are retained until you delete them or your account. When you delete content from your media library, it is permanently removed from our servers. When you delete your account, we will delete or anonymize your personal information and media library content, except where we are required to retain it for legal, regulatory, or legitimate business purposes (such as transaction records for accounting purposes).
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            Note: Content that has been processed through third-party AI services (Replicate, OpenAI, etc.) may be subject to their data retention policies. We recommend reviewing their privacy policies for information about how they handle your content.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Children&apos;s Privacy
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            International Data Transfers
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Changes to This Privacy Policy
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Contact Us
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:{" "}
            <Link href="mailto:hey@webbuddy.agency" textDecoration="underline" color="#573cff" _hover={{ color: "#4a2fd9" }}>
              hey@webbuddy.agency
            </Link>
          </Text>
        </VStack>
      </Container>
    </PageContainer>
  </Box>
);

export default PrivacyPage;

