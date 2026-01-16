import {
  ListIcon,
  ListItem,
} from "@chakra-ui/react";
import React from "react";
import { HiBadgeCheck } from "react-icons/hi";

export const CheckedListItem = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ListItem>
    <ListIcon fontSize="xl" color="brand.400" as={HiBadgeCheck} /> {children}
  </ListItem>
);
