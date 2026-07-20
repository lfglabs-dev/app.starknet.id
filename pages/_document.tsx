import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const appUrl = "https://app.starknet.id";
  return (
    <Html>
      <Head>
        <link rel="icon" href="/visuals/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2CAA6E" />
        <meta property="og:site_name" content="Starknet.id" />
        <meta property="og:title" content="Starknet ID" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Starknet ID: Your profile, seamlessly connecting you to the entire Starknet ecosystem."
        />
        <meta property="og:url" content={appUrl} />
        <meta property="og:image" content={`${appUrl}/visuals/starknetIdMetaImage.webp`} />
        <meta
          name="description"
          content="Starknet ID: Your profile, seamlessly connecting you to the entire Starknet ecosystem."
        />
        <meta name="twitter:site" content="@starknet_id" />
        <meta name="twitter:title" content="Starknet ID" />
        <meta
          name="twitter:description"
          content="Starknet ID: Your profile, seamlessly connecting you to the entire Starknet ecosystem."
        />
        <meta
          name="twitter:image"
          content={`${appUrl}/visuals/starknetIdMetaImage.webp`}
        />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:site" content="@Starknet_id" />
        <meta name="twitter:player" content="https://app.starknet.id" />
        <meta name="twitter:player:width" content="360" />
        <meta name="twitter:player:height" content="560" />
      </Head>
      <body className="default_background_color">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
