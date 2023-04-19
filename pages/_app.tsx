import React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";
import { Analytics } from "@vercel/analytics/react";

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
    new WebWalletConnector({ url: "https://web.hydrogen.argent47.net" }),
  ];

  return (
    <>
      <StarknetConfig autoConnect connectors={connectors}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Starknet.id</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
        <Analytics />
      </StarknetConfig>
    </>
  );
}

export default MyApp;
