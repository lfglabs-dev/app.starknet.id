# 🌴 Starknet id protocol interface 🌴

An open source interface for the decentralized identity protocol Starknet id.

Enabling users to:

- Create Starknet identities and domains
- Manage and monitor their starknet identities and domains
- Make calls to the starknet id serverless API

## Prerequisite 🌴

You should install a browser extension for any of these wallets below:

- ArgentX (Recommended)
- Metamask
- Bravoos
- OKX
- Bitget
- Keplr

![](/public/visuals/wallets.webp)

To learn how to add browser extensions, go [here](https://support.google.com/chrome_webstore/answer/2664769?hl=en)

Once wallet extension of your choice is installed and properly setup, switch to sepolia testnet for development purposes.
Request for testnet STRK tokens [here](https://sepolia.app.starknet.id) to pay for gas (transaction fees)

## How to use 🌴

First step, clone this repo.

```bash
git clone https://github.com/lfglabs-dev/app.starknet.id.git
```

Second step, install the dependencies.

```bash
npm install
# or
yarn add
```

If you face any issue installing the project dependencies, use this command.

```bash
npm install --force
# or
yarn install --force
```

## Setting up Development Server for testnet 🌴

- In the root of your project, create a `.env.local` file.
- Copy all the content in `.env.test` into your newly created file.
- Go to [here](https://sepolia.app.starknet.id/) and mint your domains.

**NB**: longer domain names cost less.

## Setting up Development Server for mainnet 🌴

- In the root of your project, create a `.env.local` file.
- Copy all the content in `.env.example` into your newly created file

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result and to be able to use the app.

Lastly, connect your wallet (e.g ArgentX, ensure its in testnet mode if you want to use testnet)

**NB:** You need to have mainnet token balance to pay for gas fees if you are using mainnet.

## License 🌴

Currently there is no license, this means you cannot modify or redistribute this code without explicit permission from the copyright holder.
