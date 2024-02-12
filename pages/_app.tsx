import React, { useMemo } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { StarknetConfig, alchemyProvider } from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { Analytics } from "@vercel/analytics/react";
import { StarknetIdJsProvider } from "../context/StarknetIdJsProvider";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import AcceptCookies from "../components/legal/acceptCookies";
import { goerli, mainnet } from "@starknet-react/chains";

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

export const availableConnectors = [
  new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
  new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
  new WebWalletConnector({
    url:
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? "https://web.hydrogen.argent47.net"
        : "https://web.argent.xyz/",
  }),
  new ArgentMobileConnector(),
];

function MyApp({ Component, pageProps }: AppProps) {
  const chains = [
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? goerli : mainnet,
  ];
  const providers = alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY as string,
  });

  return (
    <>
      <StarknetConfig
        chains={chains}
        provider={providers}
        connectors={availableConnectors}
        autoConnect
      >
        <StarknetIdJsProvider>
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
        </StarknetIdJsProvider>
      </StarknetConfig>
    </>
  );
}

export default MyApp;
