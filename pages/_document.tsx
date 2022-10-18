import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <link rel="icon" href="/visuals/StarknetIdLogo.png" />
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2CAA6E" />
        <meta
          property="og:site_name"
          content="StarkNet identity and naming service"
        />
        <meta property="og:title" content="Starknet.ID" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Identity and naming service for Starknet. Mint your identity and choose your .stark domain now 🔥"
        />
        <meta property="og:url" content="https://goerli.app.starknet.id/" />
        <meta property="og:image" content="/visuals/StarknetIdLogo.png" />
        <meta
          name="description"
          content="Use your Starknet ID to prove your identity on-chain."
        />
      </Head>

      <body className="default_background_color">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
