import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#2CAA6E" />
                <meta property="og:site_name" content="StarkNet identity and naming service" />
                <meta property="og:title" content="Starknet.ID" />
                <meta property="og:type" content="website" />
                <meta property="og:description" content="Mint your Starknet ID and connect it to discord, twitter and other external services." />
                <meta property="og:url" content="%PUBLIC_URL%" />
                <meta property="og:image" content="%PUBLIC_URL%/visuals/StarknetIdLogo.png" />
                <meta name="description" content="Use your Starknet ID to prove your identity on-chain." />
            </Head>

            <link rel="icon" href="/visuals/StarknetIdLogo.png" />

            <body className="default_background_color">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}