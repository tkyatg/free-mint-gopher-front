import type { AppPropsWithLayout } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <ChakraProvider>
      <RecoilRoot>
        {getLayout(
          <>
            <Component {...pageProps} />
          </>
        )}
      </RecoilRoot>
    </ChakraProvider>
  );
}
