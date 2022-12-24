import React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetProvider } from "@starknet-react/core";
import { Analytics } from "@vercel/analytics/react";

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
  ];

  return (
    <>
      <StarknetProvider connectors={connectors}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Starknet.id</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
        <Analytics />
      </StarknetProvider>
    </>
  );
}

export default MyApp;
