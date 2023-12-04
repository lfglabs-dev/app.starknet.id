"use client";

import React, { FunctionComponent, useEffect } from "react";
import Button from "../UI/button";
import styles from "../../styles/ens.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

type SolButtonProps = {
  updateSolStatus: (address: string) => void;
};

const SolanaConnectButton: FunctionComponent<SolButtonProps> = ({
  updateSolStatus,
}) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  console.log("publicKey", publicKey);

  useEffect(() => {
    if (!publicKey) return;
    const base58Pubkey = publicKey.toBase58();
    console.log("base58Pubkey", base58Pubkey);
    updateSolStatus(base58Pubkey);
  }, [publicKey]);

  return (
    <div>
      <WalletMultiButton />
    </div>
  );
};

export default SolanaConnectButton;
