import { Box, Container, Image, Heading, HStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  return (
    <>
      <Box
        bg={"white"}
        w={"100%"}
        py={2}
        bgColor={"#67DAE1"}
        alignSelf={"center"}
        borderBottom={"1px"}
        borderColor={"gray.300"}
      >
        <Container maxW={"1080px"} px={{ base: 2, md: 6 }} width={"100%"}>
          <HStack alignItems={"center"}>
            <Image
              onClick={() => {
                router.push("/");
              }}
              src="/logo.png"
              height={{ base: 12, md: 16 }}
              width={{ base: 12, md: 16 }}
              alt="gopher header icon"
            />
            <Heading color={"white"} fontSize={{ base: "xl", md: "2xl" }}>
              暇なら遊んでいけよ
            </Heading>
          </HStack>
        </Container>
      </Box>
    </>
  );
}
