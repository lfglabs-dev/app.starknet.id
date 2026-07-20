import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import {
  type Connector,
  InjectedConnector,
  jsonRpcProvider,
  StarknetConfig,
} from "@starknet-react/core";
import Navbar from "@/components/UI/navbar";
import { TransactionsProvider } from "@/hooks/useTransactions";
import { SN_MAIN, SN_MAIN_CHAIN } from "@/lib/chain/manifest";
import theme from "@/styles/theme";
import "@/styles/globals.css";

const connectors = [
  new InjectedConnector({ options: { id: "braavos" } }),
] satisfies Connector[];

const provider = jsonRpcProvider({
  rpc: () => ({ nodeUrl: SN_MAIN.rpcPath }),
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StarknetConfig
      chains={[SN_MAIN_CHAIN]}
      defaultChainId={SN_MAIN_CHAIN.id}
      provider={provider}
      connectors={connectors}
      autoConnect
    >
      <TransactionsProvider>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Starknet.id</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </TransactionsProvider>
    </StarknetConfig>
  );
}
