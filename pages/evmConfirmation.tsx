import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/components/evmConfirmation.module.css";
import Button from "@/components/UI/button";

const EvmConfirmation: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const domain: string = router.query.domain as string;

  const redirect = () => {
    if (tokenId) router.push(`/identities/${tokenId}`);
    else router.push(`/identities`);
  };

  const redirectEns = () => {
    if (domain) window.open(`https://app.ens.domains/${domain}.snid.eth`);
    else window.open(`https://app.ens.domains`);
    redirect();
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <div className={styles.balloon}>
            <img alt="floating ballon icon" src="/ens/baloon.svg" />
          </div>
          <div className={styles.title}>
            You can now send money on your metamask with{" "}
            <span className={styles.highlight}>{domain}.sNid.ETH</span>
          </div>
        </div>
        <div>
          <div className={styles.description}>
            Your EVM address has been successfully linked to{" "}
            <span className={styles.strong}>{domain}.snid.eth</span>. All EVM
            records in ENS now reflect this address. Additionally, we&apos;ve
            updated your profile with your{" "}
            <span className={styles.strong}>PFP, GitHub, Twitter</span>, and
            other verified Starknet ID information
          </div>
        </div>
        <div>
          <Button onClick={redirectEns}>Go to your ENS domain</Button>
        </div>

        <div className={styles.domainBtn}>
          <div className={styles.metamask}>
            <img alt="metamask icon" src="/ens/metamask.svg" />
          </div>
          <div onClick={redirect} className={styles.backButton}>
            Back to your domain
          </div>
        </div>
      </div>
      <div className={styles.coconutLeft}>
        <img alt="coconut tree" src="/register/coconutleft.webp" />
      </div>
      <div className={styles.coconutRight}>
        <img alt="coconut tree" src="/register/coconutright.webp" />
      </div>
    </div>
  );
};

export default EvmConfirmation;
