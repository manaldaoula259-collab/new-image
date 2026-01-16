"use client";

import PageContainer from "@/components/layout/PageContainer";
import { Link, List, ListItem, Text, VStack, Box, Container } from "@chakra-ui/react";
import NextImage from "next/image";

const TermsPage = () => (
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
            MyDzine Terms of Service
          </Text>

          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Welcome to MyDzine, an AI-powered creative platform offering 100+ tools for image generation, video creation, photo editing, and artistic transformations. These Terms of Service (&quot;Terms&quot;) govern your access to and use of MyDzine&apos;s services, website, and platform. By accessing or using MyDzine, you agree to be bound by these Terms.
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
            Acceptance of Terms
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            By creating an account, accessing, or using MyDzine, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our services.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Description of Service
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            MyDzine provides an AI-powered creative platform with 100+ tools including:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>AI Image Generation (40+ models including FLUX, Ideogram, Stable Diffusion, and more)</ListItem>
            <ListItem>AI Video Generation (12 models including Kling 2.0, Luma Dream Machine, Runway Gen-3, and more)</ListItem>
            <ListItem>Photo Conversion and Style Transfer (Studio Ghibli, Pixar, Disney, and 15+ artistic styles)</ListItem>
            <ListItem>Photo Editing Tools (background removal, object removal/addition, photo enhancement, and more)</ListItem>
            <ListItem>AI Art Generators (character, anime, comic, coloring book, and vector image generation)</ListItem>
            <ListItem>Image Effects and Filters (face swap, style transfer, anime filter, and more)</ListItem>
            <ListItem>Media Library for storing and organizing your generated content</ListItem>
          </List>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            User Accounts and Registration
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            To use MyDzine, you must create an account. You are responsible for:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Providing accurate and complete information when creating your account</ListItem>
            <ListItem>Maintaining the security of your account credentials</ListItem>
            <ListItem>All activities that occur under your account</ListItem>
            <ListItem>Notifying us immediately of any unauthorized use of your account</ListItem>
          </List>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Credits and Payment
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            MyDzine operates on a credit-based system. Credits are required to use our AI tools and services. You may purchase credits through our pricing plans or receive credits as part of a subscription. Credits are non-refundable and non-transferable. Unused credits do not expire unless otherwise stated in your subscription terms.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            All payments are processed securely through third-party payment processors. By making a purchase, you agree to the payment terms and pricing displayed at the time of purchase.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Content Upload and Usage
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            When you upload images, videos, or other content to MyDzine, you represent and warrant that:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>You own the rights to the content or have obtained all necessary permissions and licenses</ListItem>
            <ListItem>The content does not violate any laws, regulations, or third-party rights</ListItem>
            <ListItem>The content is not illegal, harmful, threatening, abusive, defamatory, or obscene</ListItem>
            <ListItem>The content does not contain malware, viruses, or other harmful code</ListItem>
            <ListItem>You have the right to use the content for AI processing and generation</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            We reserve the right to review, moderate, and remove any content that violates these Terms or applicable laws. We are not responsible for any harm that may result from uploading content that does not meet these criteria.
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
            You retain ownership of all AI-generated content created using MyDzine. However, you are responsible for ensuring that generated content:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Does not infringe on the intellectual property rights of others</ListItem>
            <ListItem>Complies with all applicable laws and regulations</ListItem>
            <ListItem>Is not used for illegal, harmful, or prohibited purposes</ListItem>
            <ListItem>Does not violate our Acceptable Use Policy</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            MyDzine does not claim ownership of your generated content. You grant us a limited license to store, display, and process your content solely for the purpose of providing our services to you.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Acceptable Use Policy
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You agree not to use MyDzine to:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Generate illegal, harmful, threatening, abusive, or defamatory content</ListItem>
            <ListItem>Create content that violates intellectual property rights</ListItem>
            <ListItem>Generate explicit, pornographic, or adult content</ListItem>
            <ListItem>Create content that impersonates others or misrepresents identity</ListItem>
            <ListItem>Use the service for spam, harassment, or abuse</ListItem>
            <ListItem>Attempt to reverse engineer, decompile, or extract AI models</ListItem>
            <ListItem>Interfere with or disrupt the service or servers</ListItem>
            <ListItem>Use automated systems to access the service without authorization</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            Violation of this Acceptable Use Policy may result in immediate termination of your account and legal action.
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
        Information we collect includes both information you knowingly and
        actively provide us when using or participating in any of our services
        and promotions, and any information automatically sent by your devices
        in the course of accessing our products and services.{" "}
      </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Log Data
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
        When you visit our website, our servers may automatically log the
        standard data provided by your web browser. It may include your device’s
        Internet Protocol (IP) address, your browser type and version, the pages
        you visit, the time and date of your visit, the time spent on each page,
        other details about your visit, and technical details that occur in
        conjunction with any errors you may encounter.{" "}
      </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Please be aware that while this information may not be personally
            identifying by itself, it may be possible to combine it with other data
            to personally identify individual persons.{" "}
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
        We may ask for personal information which may include one or more of the
        following:{" "}
      </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>Email</ListItem>
          </List>
          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Legitimate Reasons for Processing Your Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
        We only collect and use your personal information when we have a
        legitimate reason for doing so. In which instance, we only collect
        personal information that is reasonably necessary to provide our
        services to you.{" "}
      </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Collection and Use of Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
        We may collect personal information from you when you do any of the
        following on our platform:{" "}
      </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>
              Create an account and authenticate using our authentication service
            </ListItem>
            <ListItem>
              Upload images, videos, or other content for AI processing
            </ListItem>
            <ListItem>
              Use our AI tools to generate images, videos, or artistic transformations
            </ListItem>
            <ListItem>
              Purchase credits or subscription plans
            </ListItem>
            <ListItem>
              Save generated content to your media library
            </ListItem>
            <ListItem>
              Contact us via email, social media, or support channels
            </ListItem>
            <ListItem>When you mention us on social media</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We may collect, hold, use, and disclose information for the following
            purposes, and personal information will not be further processed in a
            manner that is incompatible with these purposes:{" "}
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>
              to enable you to access and use our AI-powered platform, tools, and services
            </ListItem>
            <ListItem>
              to process your content through AI models and generate requested outputs
            </ListItem>
            <ListItem>
              to manage your account, credits, and subscription plans
            </ListItem>
            <ListItem>
              to store and organize your generated content in your media library
            </ListItem>
            <ListItem>
              to provide customer support and respond to your inquiries
            </ListItem>
            <ListItem>
              to improve our services and develop new features
            </ListItem>
            <ListItem>
              to detect, prevent, and address technical issues, security threats, and abuse
            </ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Please be aware that we may combine information we collect about you
            with general information or research data we receive from other trusted
            sources.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            Security of Your Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            When we collect and process personal information, and while we retain
            this information, we will protect it within commercially acceptable
            means to prevent loss and theft, as well as unauthorized access,
            disclosure, copying, use, or modification.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Although we will do our best to protect the personal information you
            provide to us, we advise that no method of electronic transmission or
            storage is 100% secure, and no one can guarantee absolute data security.
            We will comply with laws applicable to us in respect of any data breach.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You are responsible for selecting any password and its overall security
            strength, ensuring the security of your own information within the
            bounds of our services.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={3}
          >
            How Long We Keep Your Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We keep your personal information only for as long as we need to. This
            time period may depend on what we are using your information for, in
            accordance with this privacy policy. If your personal information is no
            longer required, we will delete it or make it anonymous by removing all
            details that identify you.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            However, if necessary, we may retain your personal information for our
            compliance with a legal, accounting, or reporting obligation or for
            archiving purposes in the public interest, scientific, or historical
            research purposes or statistical purposes.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You may delete individual items from your media library at any time. Deleted content is permanently removed from our servers and cannot be recovered.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            To request that your account and all associated data be deleted, please
            send an email to{" "}
            <Link href="mailto:hey@webbuddy.agency" color="#573cff" _hover={{ color: "#4a2fd9" }}>hey@webbuddy.agency</Link>. Please
            note that by deleting your account, you will no longer have access to
            any of the data or content associated with your account, including your media library and unused credits.
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
            We do not aim any of our products or services directly at children under
            the age of 13, and we do not knowingly collect personal information
            about children under 13.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Disclosure of Personal Information to Third Parties
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We may disclose personal information to:{" "}
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>a parent, subsidiary, or affiliate of our company</ListItem>
            <ListItem>
              third party service providers for the purpose of enabling them to
              provide their services, for example, IT service providers, data
              storage, hosting and server providers, advertisers, or analytics
              platforms
            </ListItem>
            <ListItem>our employees, contractors, and/or related entities</ListItem>
            <ListItem>
              our existing or potential agents or business partners
            </ListItem>
            <ListItem>
              sponsors or promoters of any competition, sweepstakes, or promotion we
              run
            </ListItem>
            <ListItem>
              courts, tribunals, regulatory authorities, and law enforcement
              officers, as required by law, in connection with any actual or
              prospective legal proceedings, or in order to establish, exercise, or
              defend our legal rights
            </ListItem>
            <ListItem>
              third parties, including agents or sub-contractors, who assist us in
              providing information, products, services, or direct marketing to you
              third parties to collect and process data
            </ListItem>
          </List>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            International Transfers of Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            The personal information we collect is stored and/or processed where we
            or our partners, affiliates, and third-party providers maintain
            facilities. Please be aware that the locations to which we store,
            process, or transfer your personal information may not have the same
            data protection laws as the country in which you initially provided the
            information. If we transfer your personal information to third parties
            in other countries: (i) we will perform those transfers in accordance
            with the requirements of applicable law; and (ii) we will protect the
            transferred personal information in accordance with this privacy policy.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Your Rights and Controlling Your Personal Information
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            You always retain the right to withhold personal information from us,
            with the understanding that your experience of our website may be
            affected. We will not discriminate against you for exercising any of
            your rights over your personal information. If you do provide us with
            personal information you understand that we will collect, hold, use and
            disclose it in accordance with this privacy policy. You retain the right
            to request details of any personal information we hold about you.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If we receive personal information about you from a third party, we will
            protect it as set out in this privacy policy. If you are a third party
            providing personal information about somebody else, you represent and
            warrant that you have such person&apos;s consent to provide the personal
            information to us.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If you have previously agreed to us using your personal information for
            direct marketing purposes, you may change your mind at any time. We will
            provide you with the ability to unsubscribe from our email-database or
            opt out of communications. Please be aware we may need to request
            specific information from you to help us confirm your identity.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If you believe that any information we hold about you is inaccurate, out
            of date, incomplete, irrelevant, or misleading, please contact us using
            the details provided in this privacy policy. We will take reasonable
            steps to correct any information found to be inaccurate, incomplete,
            misleading, or out of date.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If you believe that we have breached a relevant data protection law and
            wish to make a complaint, please contact us using the details below and
            provide us with full details of the alleged breach. We will promptly
            investigate your complaint and respond to you, in writing, setting out
            the outcome of our investigation and the steps we will take to deal with
            your complaint. You also have the right to contact a regulatory body or
            data protection authority in relation to your complaint.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Use of Cookies
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We use &ldquo;cookies&rdquo; to collect information about you and your
            activity across our site. A cookie is a small piece of data that our
            website stores on your computer, and accesses each time you visit, so we
            can understand how you use our site. This helps us serve you content
            based on preferences you have specified.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Service Availability and Modifications
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We strive to provide reliable and continuous access to MyDzine, but we do not guarantee that the service will be available at all times. We may experience downtime due to maintenance, updates, technical issues, or circumstances beyond our control. We reserve the right to modify, suspend, or discontinue any part of our service at any time with or without notice.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            We may add, remove, or modify features, tools, or AI models at our discretion. We are not obligated to provide refunds or credits for changes to the service.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Disclaimers and Limitations of Liability
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            MyDzine is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that:
          </Text>
          <List listStyleType="initial" pl={4} fontFamily="'General Sans', 'Inter', sans-serif" color="rgba(0, 0, 0, 0.8)">
            <ListItem>The service will meet your specific requirements or expectations</ListItem>
            <ListItem>AI-generated content will be accurate, appropriate, or suitable for your intended use</ListItem>
            <ListItem>The service will be uninterrupted, timely, secure, or error-free</ListItem>
            <ListItem>Results from AI models will be consistent or predictable</ListItem>
          </List>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            To the maximum extent permitted by law, MyDzine shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our service.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Termination
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            We reserve the right to suspend or terminate your account and access to MyDzine at any time, with or without cause or notice, for any reason including, but not limited to, breach of these Terms, violation of our Acceptable Use Policy, or fraudulent, abusive, or illegal activity. Upon termination, your right to use the service will immediately cease, and we may delete your account and all associated data.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
            mt={2}
          >
            You may terminate your account at any time by contacting us. Upon termination, unused credits are forfeited and cannot be refunded.
          </Text>

          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Limits of Our Policy
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            Our website may link to external sites that are not operated by us.
            Please be aware that we have no control over the content and policies of
            those sites, and cannot accept responsibility or liability for their
            respective privacy practices.{" "}
          </Text>
          <Text
            fontWeight="600"
            fontSize={{ base: "lg", md: "xl" }}
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="black"
            mt={4}
          >
            Changes to This Policy
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            At our discretion, we may change our privacy policy to reflect updates
            to our business processes, current acceptable practices, or legislative
            or regulatory changes. If we decide to change this privacy policy, we
            will post the changes here at the same link by which you are accessing
            this privacy policy.{" "}
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.7"
            fontFamily="'General Sans', 'Inter', sans-serif"
            color="rgba(0, 0, 0, 0.8)"
          >
            If required by law, we will get your permission or give you the
            opportunity to opt in to or opt out of, as applicable, any new uses of
            your personal information.{" "}
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
            For any questions or concerns regarding your privacy, you may contact us
            using the following details:{" "}
            <Link href="mailto:hey@webbuddy.agency" color="#573cff" _hover={{ color: "#4a2fd9" }}>hey@webbuddy.agency</Link>
          </Text>
        </VStack>
      </Container>
    </PageContainer>
  </Box>
);

export default TermsPage;
