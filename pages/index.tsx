import Head from "next/head";
import {
  Container,
  Text,
  GridItem,
  Grid,
  Stack,
  Image,
  Heading,
  Button,
  Flex,
  HStack,
  Tag,
  Tooltip,
  Card,
  CardBody,
  Divider,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Spacer,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import type { GetServerSideProps, NextPageWithLayout } from "next";
import { Layout } from "@/components/layout/default";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ethers, providers } from "ethers";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnect from "@walletconnect/client";
const nfts = [
  {
    name: "普通のGopherくん（正）",
    imageUrl: "/gophers/1.png",
  },
  {
    name: "Gopherくんの横顔（左）",
    imageUrl: "/gophers/2.png",
  },
  {
    name: "Gopherくんの横顔（右）",
    imageUrl: "/gophers/3.png",
  },
  {
    name: "狂気のGopherくん（？）",
    imageUrl: "/gophers/4.png",
  },
];
const abiJson = require("../contracts/abi.json");
const contractAddress = "0xEf473F2eFDE884950b93C6dC0d31825a4c1aE42F";

type Props = {
  totalSupplyHex: string;
};

const Home: NextPageWithLayout = ({ totalSupplyHex }: Props) => {
  const [totalSupply, _] = useState<BigInt>(BigInt(totalSupplyHex));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalRef = useRef(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const [tokenId, setTokenId] = useState<number>();
  const [connector, setConnector] = useState<WalletConnect>();
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: QRCodeModal,
    });
    setConnector(connector);
    if (connector.accounts[0]) {
      setAddress(connector.accounts[0]);
    }
  }, [totalSupply]);

  async function walletConnectLogin() {
    if (!connector) {
      return;
    }
    if (!connector.connected) {
      await connector.createSession();
    }
    connector.on("connect", (error, account) => {
      if (error) {
        console.error(error);
        return;
      }
      setAddress(account.params[0].accounts[0]);
    });
    connector.on("disconnect", async () => {
      await connector.killSession();
    });
  }

  // mintを行う
  async function mintNft() {
    if (loading || !address || !connector) {
      return;
    }
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth_goerli"
    );
    const signer = new ethers.VoidSigner(address, provider);
    const contract = new ethers.Contract(
      contractAddress,
      abiJson["abi"],
      signer
    );
    const fragment = contract.interface.getFunction("safeMint");
    const selectorHash = contract.interface.getSighash(fragment);

    setLoading(true);
    setLoadingMessage("sending transaction...");
    try {
      const beforeTotalSupply = await contract.totalSupply();
      const txHash = await connector.sendTransaction({
        from: address,
        to: contractAddress,
        data: selectorHash,
        value: ethers.utils.parseEther("0.01")._hex,
      });
      toast({
        description: "send transaction success",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
      await watchTransactionResult(txHash, beforeTotalSupply);
    } catch (err: any) {
      toast({
        description: err.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
      console.log(err);
      onClose();
      setLoading(false);
    }
  }

  // transactionの完了を待って、結果を取得する
  async function watchTransactionResult(
    txHash: string,
    beforeTotalSupply: any
  ) {
    if (!txHash) {
      setLoading(false);
      return;
    }
    const account = connector?.accounts[0];
    if (!account) {
      setLoading(false);
      return;
    }
    setLoadingMessage("waiting complite transaction...");
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth_goerli"
    );
    const signer = new ethers.VoidSigner(connector.accounts[0], provider);
    const contract = new ethers.Contract(
      contractAddress,
      abiJson["abi"],
      signer
    );

    let wacher = setInterval(async () => {
      const receipt = await provider.getTransactionReceipt(txHash);
      console.log(receipt);
      if (receipt) {
        const afterTotalSupply = await contract.totalSupply();
        onOpen();
        console.log(afterTotalSupply);
        console.log(beforeTotalSupply);
        for (
          let i: number = beforeTotalSupply.toNumber();
          i < afterTotalSupply.toNumber();
          i++
        ) {
          const owner = await contract.ownerOf(i);
          if (account == owner.toLowerCase()) {
            setTokenId(i);
            const imageUrl = await contract.tokenURI(i);
            setImageUrl(imageUrl);
          }
          setLoading(false);
          clearInterval(wacher);
        }
      }
    }, 1000);
  }

  return (
    <Layout>
      <>
        <Head>
          <title>GopherランダムNFTガチャ</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/logo.png" />
        </Head>
        <Container
          maxW={"container"}
          px={{ base: 3, md: 6 }}
          maxWidth={"container.lg"}
          my={{ base: 3, md: 6 }}
        >
          <Stack spacing={{ base: 6, md: 10 }}>
            <Image
              height={{ base: 100, sm: 140, md: 200 }}
              width={"full"}
              rounded={"md"}
              src="main.png"
              alt="img"
              objectFit="cover"
            />
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(5, 1fr)",
              }}
              gap={12}
            >
              <GridItem order={{ base: 1, md: 2 }} colSpan={{ base: 1, md: 3 }}>
                <Stack spacing={6}>
                  <Stack>
                    <Heading
                      color="gray.700"
                      fontSize={{ base: "2xl", md: "2xl" }}
                    >
                      ランダムGopher NFTガチャ
                    </Heading>
                    <HStack spacing={2}>
                      <Tooltip label="コレクティブNFT" aria-label="A tooltip">
                        <Tag variant="solid" colorScheme="cyan">
                          Collective
                        </Tag>
                      </Tooltip>
                      <Tooltip label="誰でもmint可能" aria-label="A tooltip">
                        <Tag variant="solid" colorScheme="green">
                          Free mint
                        </Tag>
                      </Tooltip>
                      <Tooltip label="無料で遊べます" aria-label="A tooltip">
                        <Tag variant="solid" colorScheme="red">
                          Testnet
                        </Tag>
                      </Tooltip>
                    </HStack>
                  </Stack>
                  <Stack>
                    <Text color="gray.700">
                      GopherくんのNFTがランダムに出現するガチャです。
                      <br />
                      全4種類。
                    </Text>
                    <Text color="gray.700">
                      テスト環境のため、無料で利用できます。
                    </Text>
                    <Text color="blue.500">
                      <Link
                        href={
                          "https://zenn.dev/takuya911/articles/free-mint-gopher"
                        }
                      >
                        このアプリについて（zenn）
                      </Link>
                    </Text>
                    <Text color="gray.700">
                      🚨オリジナルの The Go gopher（Gopher くん）は、Renée
                      French によってデザインされました。
                    </Text>
                  </Stack>
                  <Stack spacing={6}>
                    <Flex>
                      <Heading color="gray.700" fontSize="lg">
                        Price(Goerli)
                      </Heading>
                      <HStack ml={"auto"}>
                        <Text fontWeight={"bold"}>0.01 eth</Text>
                      </HStack>
                    </Flex>

                    {address ? (
                      loading ? (
                        <Button
                          colorScheme={"twitter"}
                          size={"md"}
                          w={{ base: "full" }}
                          rounded={"md"}
                          variant="outline"
                        >
                          <HStack>
                            <Spinner size={"sm"} />
                            <Text>{loadingMessage}</Text>
                          </HStack>
                        </Button>
                      ) : (
                        <Button
                          colorScheme={"twitter"}
                          size={"md"}
                          w={{ base: "full" }}
                          rounded={"md"}
                          variant="outline"
                          onClick={() => {
                            mintNft();
                          }}
                        >
                          <HStack>
                            <Text>ガチャを回す</Text>
                          </HStack>
                        </Button>
                      )
                    ) : (
                      <Button
                        colorScheme={"blue"}
                        size={"md"}
                        variant="outline"
                        w={{ base: "full" }}
                        rounded={"md"}
                        onClick={() => {
                          walletConnectLogin();
                        }}
                      >
                        <HStack>
                          <Image
                            height={6}
                            width={6}
                            alt={"metamask icon"}
                            src={"/walletconnect.svg"}
                          ></Image>
                          <Text>wallet connect</Text>
                        </HStack>
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </GridItem>
              <GridItem order={{ base: 2, md: 1 }} colSpan={{ base: 1, md: 2 }}>
                <Stack>
                  <Card bg="white">
                    <CardBody>
                      <Stack>
                        <Heading
                          color="gray.700"
                          fontSize="md"
                          fontFamily="body"
                        >
                          ガチャ情報
                        </Heading>
                        <Divider />
                        <Stack>
                          <Flex>
                            <Text color="gray.700">Network</Text>
                            <Spacer />
                            <Text color="gray.700">Goerli</Text>
                          </Flex>
                          <Flex>
                            <Text color="gray.700">Contract Address</Text>
                            <Spacer />
                            <Text color="blue.500">
                              <Link
                                href={
                                  "https://goerli.etherscan.io/address/0xEf473F2eFDE884950b93C6dC0d31825a4c1aE42F"
                                }
                              >
                                {contractAddress.slice(0, 4) +
                                  "..." +
                                  contractAddress.slice(-4)}
                              </Link>
                            </Text>
                          </Flex>
                          <Flex>
                            <Text color="gray.700">
                              これまでに実行された回数
                            </Text>
                            <Spacer />
                            <Text color="gray.700">
                              {totalSupply?.toString()}
                            </Text>
                          </Flex>
                          <Flex>
                            <Text color="gray.700">ガチャガチャ残り</Text>
                            <Spacer />
                            <Text color="gray.700">∞</Text>
                          </Flex>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                  <Card bg="white">
                    <CardBody>
                      <Stack>
                        <Heading
                          color="gray.700"
                          fontSize="md"
                          fontFamily="body"
                        >
                          運営情報
                        </Heading>
                        <Divider />
                        <Stack>
                          <Flex>
                            <Text color="gray.700">Twitter</Text>
                            <Spacer />
                            <Text color="blue.500">
                              <Link href={"https://twitter.com/takuya_web3"}>
                                @takuya_web3
                              </Link>
                            </Text>
                          </Flex>
                          <Flex>
                            <Text color="gray.700">Github</Text>
                            <Spacer />
                            <Text color="blue.500">
                              <Link
                                href={
                                  "https://github.com/tkyatg/free-mint-gopher-front"
                                }
                              >
                                Front Repository
                              </Link>
                            </Text>
                          </Flex>
                          <Flex>
                            <Spacer />
                            <Text color="blue.500">
                              <Link
                                href={
                                  "https://github.com/tkyatg/free-mint-gopher-contract"
                                }
                              >
                                Contract Repository
                              </Link>
                            </Text>
                          </Flex>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
          <Stack mt={{ base: 10, md: 16 }}>
            <Text fontSize={"xl"} fontWeight={"bold"}>
              NFTの種類({nfts.length})
            </Text>
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={{ base: 1, md: 4 }}
            >
              {nfts.map((nft, i) => {
                return (
                  <GridItem key={i}>
                    <Card
                      bg="white"
                      boxShadow="md"
                      border="1px"
                      borderColor="gray.100"
                    >
                      <CardBody>
                        <Image
                          height={{ base: "full" }}
                          width={"full"}
                          objectFit="cover"
                          rounded={"md"}
                          src={nft.imageUrl}
                          alt="img"
                        />
                        <Stack mt={4}>
                          <Text
                            color="gray.700"
                            fontWeight={"bold"}
                            wordBreak={"break-all"}
                            fontSize={{ base: "sm", md: "md" }}
                          >
                            {nft.name}
                          </Text>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                );
              })}
            </Grid>
          </Stack>
          <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader textAlign={"center"}>
                {imageUrl
                  ? "🎉 このGopherくんが当たりました 🎉"
                  : "Minting...(10秒くらい)"}
              </ModalHeader>
              <ModalBody>
                {imageUrl ? (
                  <Image
                    height={{ base: "full" }}
                    width={"full"}
                    objectFit="cover"
                    rounded={"md"}
                    src={imageUrl}
                    alt="img"
                  />
                ) : (
                  <Skeleton>
                    <Image
                      height={{ base: "full" }}
                      width={"full"}
                      objectFit="cover"
                      rounded={"md"}
                      src={"gophers/1.png"}
                      alt="img"
                    />
                  </Skeleton>
                )}
                <Stack mt={2}>
                  <Text
                    color="gray.700"
                    fontWeight={"bold"}
                    wordBreak={"break-all"}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {tokenId ? `Token ID #${tokenId}` : "loading..."}
                  </Text>
                </Stack>
              </ModalBody>
              <ModalFooter>
                {tokenId && (
                  <Button colorScheme="twitter" onClick={onClose}>
                    閉じる
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </>
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth_goerli"
  );
  const contract = new ethers.Contract(
    contractAddress,
    abiJson["abi"],
    provider
  );
  const totalSupply = await contract.totalSupply();
  const props: Props = {
    totalSupplyHex: totalSupply._hex,
  };

  return {
    props: props,
  };
};
