import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { Analytics } from "@vercel/analytics/react";
import { StarknetIdJsProvider } from "../context/StarknetIdJsProvider";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { useRouter } from "next/router";
import Notification from "../components/UI/notification";

// Wallet Connectors
const connectors = [
  new InjectedConnector({ options: { id: "argentX" } }),
  new InjectedConnector({ options: { id: "braavos" } }),
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
  const [cookiesAccepted, setCookiesAccepted] = useState(true);

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCookiesAccepted(localStorage.getItem("cookiesAccepted") === "true");
  }, []);

  return (
    <>
      <StarknetConfig connectors={connectors} autoConnect>
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
            <Notification visible={!cookiesAccepted} severity="info">
              <div className="flex flex-wrap sm:gap-20 gap-5">
                <p>
                  We use cookies to ensure you get the best experience on our
                  website
                </p>{" "}
                <div className="flex">
                  <>
                    <a
                      className="hover:underline"
                      href="https://www.starknet.id/pdfs/PrivacyPolicy.pdf"
                      target="blank"
                    >
                      Privacy Policy
                    </a>
                  </>

                  <strong
                    className="ml-3 mr-1 cursor-pointer"
                    onClick={() => {
                      setCookiesAccepted(true);
                      localStorage.setItem("cookiesAccepted", "true");
                    }}
                  >
                    OK
                  </strong>
                </div>
              </div>
            </Notification>
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
