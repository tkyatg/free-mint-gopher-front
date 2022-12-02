import { Box, Container } from "@chakra-ui/react";

export default function Header() {
  return (
    <>
      <Box bg={"white"} w={"100%"} py={"4"} alignSelf={"center"}>
        <Container
          maxW={"container"}
          px={{ base: 3, md: 6 }}
          display={"flex"}
          width={"100%"}
        >
          header
        </Container>
      </Box>
    </>
  );
}
