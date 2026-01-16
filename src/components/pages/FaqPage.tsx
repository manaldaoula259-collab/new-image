"use client";

import PageContainer from "@/components/layout/PageContainer";
import { Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

const FaqPage = () => (
  <PageContainer>
    <VStack
      marginX="auto"
      maxWidth="container.lg"
      p={{ base: 6, md: 10 }}
      spacing={4}
      backgroundColor="var(--bg-surface)"
      borderRadius="2xl"
      width="100%"
      alignItems="flex-start"
      border="1px solid var(--border-subtle)"
      boxShadow="0 35px 80px rgba(8, 14, 26, 0.55)"
    >
      <Text fontWeight="bold" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}>
        Frequently Asked Questions
      </Text>

      <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
        📸 What kind of photos should I upload to the platform?
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        We recommend that you upload a variety of photos to ensure that your
        avatar is as accurate as possible. This may include close-up shots of
        your face, photos of your profile, and full-body shots. {`It's`}{" "}
        important to make sure that your photos are clear and of high quality,
        and that they do not include any other people or animals. We also
        recommend that you include a range of expressions, locations,
        backgrounds, and perspectives in your photos to create the most accurate
        avatar possible.
      </Text>
      <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
        👩‍🎨 How similar will the avatar be to my appearance?
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        The accuracy of your avatar will largely depend on the number and
        variety of the photos that you provide. The better and more diverse the
        photos are, the easier it will be for the AI to understand and replicate
        your facial and bodily characteristics. As a result, your avatar will be
        more likely to closely resemble your actual appearance!
      </Text>
      <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
        💰 Is it possible to obtain a refund?
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        It is possible to obtain a refund for purchases made within the first 14
        days, as long as you have not yet trained the AI. However, once the
        14-day period has passed or if you have already used the service (by
        clicking on the train button), you will no longer be eligible for a
        refund.
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        Please ensure that you upload a sufficient number of high-quality photos
        to avoid disappointment with the generated avatars!
      </Text>
      <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
        🖼 What will happen to my photos?
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        You may delete all of the photos and datasets associated with the studio
        by deleting the studio from your account. Once the studio credits have
        been exhausted, the model will be automatically deleted within 24 hours.
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        To request that your account and all associated data be deleted, please
        send an email to{" "}
        <Link href="mailto:support@photoshot">support@photoshot</Link>. Please
        note that by deleting your account, you will no longer have access to
        any of the data or content associated with your account.
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
        Please be aware that only the data on MyDzine servers will be deleted.
        Data that was transmitted to Replicate will not be deleted. You would
        have to contact them in order to do so, according to their{" "}
        <Link href="https://replicate.com/privacy">Terms of Service</Link>.
      </Text>
    </VStack>
  </PageContainer>
);

export default FaqPage;
