import React, { useEffect } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";
import { Analytics } from "@vercel/analytics/react";
import { StarknetIdJsProvider } from "../context/StarknetIdJsProvider";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { useRouter } from "next/router";
import AcceptCookies from "../components/legal/acceptCookies";
import FreshConnector from "fresh-connector";
// const fresh = new FreshConnector()
const fresh = new FreshConnector({show: false, url: "http://localhost:3000/fresh"})

const connectors = [
  new InjectedConnector({ options: { id: "argentX" } }),
  new InjectedConnector({ options: { id: "braavos" } }),
  new WebWalletConnector({
    url:
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? "https://web.hydrogen.argent47.net"
        : "https://web.argent.xyz/",
  }),
  fresh
];

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: "https://app.posthog.com",
    session_recording: {
      recordCrossOriginIframes: true,
    },
  });
  (window as any).posthog = posthog;
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <>
      <StarknetConfig connectors={connectors as any} autoConnect>
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
