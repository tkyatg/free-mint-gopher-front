import { Box, Container, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function Footer() {
  return (
    <Container
      maxW={"container"}
      px={{ base: 3, md: 6 }}
      maxWidth={"container.xl"}
      my={{ base: 6, md: 10 }}
    >
      <HStack spacing={4}>
        <Link href="/">
          <Text textColor={"gray.700"}>Docs</Text>
        </Link>
        <Link href="/">
          <Text textColor={"gray.700"}>Contact</Text>
        </Link>
      </HStack>
    </Container>
  );
}
