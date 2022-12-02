import { Box } from "@chakra-ui/react";
import { ReactElement } from "react";
import Footer from "@/components/core/fotter";
import Header from "@/components/core/header";

type LayoutProps = Required<{
  readonly children: ReactElement;
}>;

export const Layout = ({ children }: LayoutProps) => (
  <>
    {/* <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });`,
        }}
      /> */}
    <Header />
    <Box>{children}</Box>
    <Footer />
  </>
);
