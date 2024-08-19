import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <link rel="icon" href="/visuals/StarknetIdLogo.svg" />
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2CAA6E" />
        <meta property="og:site_name" content="Starknet.id" />
        <meta
          property="og:title"
          content="Starknet.id - Identity and Naming service for Starknet."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Starknet.id allows you to create your starknet passport. Create a virgin identity or link your existing one to a .stark domain to building your Starknet Reputation !"
        />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_LINK} />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_APP_LINK}/visuals/starknetIdMeta.webp`}
        />
        <meta
          name="description"
          content="Starknet.id allows you to create your starknet passport. Create a virgin identity or link your existing one to a .stark domain to building your Starknet Reputation !"
        />
        <meta name="twitter:site" content="@starknet_id" />
        <meta
          name="twitter:title"
          content="Starknet.id - Identity and Naming service for Starknet."
        />
        <meta
          name="twitter:description"
          content="Starknet.id allows you to create your starknet passport. Create a virgin identity or link your existing one to a .stark domain to building your Starknet Reputation !"
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_APP_LINK}/visuals/starknetIdMeta.webp`}
        />
      </Head>

      <body className="default_background_color">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
