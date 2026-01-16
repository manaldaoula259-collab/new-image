import { Flex, FlexProps } from "@chakra-ui/react";
import React from "react";

const PageContainer = (props: FlexProps) => {
  return (
    <Flex
      width="100%"
      maxWidth="container.lg"
      flex="1"
      pt={{ base: "90px", md: "110px" }}
      pb={{ base: 6, md: 10 }}
      flexDirection="column"
      marginX="auto"
      px={{ base: 3, sm: 4, md: 6 }}
      {...props}
    />
  );
};

export default PageContainer;
