import { useMemo } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { StarknetProvider } from "@starknet-react/core";
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  const chains = [mainnet, sepolia]; // We support both chains so that we can detect if the user is on the wrong one
  const providers = jsonRpcProvider({
    rpc: (_chain: Chain) => ({
      nodeUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
    }),
  });

  const solNetwork = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  // initialise all the wallets you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new CloverWalletAdapter(),
      new SolongWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SalmonWalletAdapter(),
      new MathWalletAdapter(),
      new Coin98WalletAdapter(),
      new HuobiWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new NekoWalletAdapter(),
      new TrustWalletAdapter(),
      new NightlyWalletAdapter(),
    ],
    []
  );

  return (
    <>
      <StarknetProvider connectors={connectors}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Starknet.id</title>
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </StarknetProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
