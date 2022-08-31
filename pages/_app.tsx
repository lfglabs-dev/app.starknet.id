import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetProvider } from "@starknet-react/core";

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
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </StarknetProvider>
    </>
  );
}

export default MyApp;
