import React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import {
  Connector,
  StarknetConfig,
  jsonRpcProvider,
} from "@starknet-react/core";
import { Analytics } from "@vercel/analytics/react";
import { StarknetIdJsProvider } from "../context/StarknetIdJsProvider";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import AcceptCookies from "../components/legal/acceptCookies";
import { Chain, sepolia, mainnet } from "@starknet-react/chains";
import { getConnectors } from "@/utils/connectorWrapper";
import { IdentityRefreshProvider } from "../components/providers/IdentityRefreshProvider";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: "https://app.posthog.com",
    session_recording: {
      recordCrossOriginIframes: true,
    },
    capture_pageleave: false,
  });
  (window as any).posthog = posthog;
}

function MyApp({ Component, pageProps }: AppProps) {
  const chains = [mainnet, sepolia]; // We support both chains so that we can detect if the user is on the wrong one
  const providers = jsonRpcProvider({
    rpc: (_chain: Chain) => ({
      nodeUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
    }),
  });

  return (
    <>
      <StarknetConfig
        chains={chains}
        provider={providers}
        connectors={
          getConnectors() as Connector[]
          // addWalnutLogsToConnectors({
          //   connectors: getConnectors(),
          //   apiKey: process.env.NEXT_PUBLIC_WALNUT_API_KEY as string,
          // }) as any
        }
        autoConnect
      >
        <StarknetIdJsProvider>
          <IdentityRefreshProvider>
            <ThemeProvider theme={theme}>
              <Head>
                <title>Starknet.id</title>
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
                />
              </Head>
              <Navbar />
              <AcceptCookies message="We'd love to count you on our traffic stats to ensure you get the best experience on our website !" />
              <PostHogProvider client={posthog}>
                <Component {...pageProps} />
              </PostHogProvider>
            </ThemeProvider>
            <Analytics />
          </IdentityRefreshProvider>
        </StarknetIdJsProvider>
      </StarknetConfig>
    </>
  );
}

export default MyApp;
