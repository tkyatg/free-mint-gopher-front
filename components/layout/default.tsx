import { Box } from "@chakra-ui/react";
import { ReactElement } from "react";
import Header from "@/components/core/header";

type LayoutProps = Required<{
  readonly children: ReactElement;
}>;

export const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <Box>{children}</Box>
  </>
);
