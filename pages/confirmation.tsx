import React, { useState } from "react";
import { NextPage } from "next";
import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/router";
import styles from "../styles/components/confirmation.module.css";
import Button from "@/components/UI/button";
import { minifyAddress } from "@/utils/stringService";
import theme from "@/styles/theme";
import CopyIcon from "@/components/UI/iconsComponents/icons/copyIcon";
import DoneFilledIcon from "@/components/UI/iconsComponents/icons/doneFilledIcon";

const Confirmation: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const tokenId: string = router.query.tokenId as string;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!address) return;
    setCopied(true);
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_LINK}?sponsor=${address}`
    );
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const redirect = () => {
    if (tokenId) router.push(`/identities/${tokenId}`);
    else router.push(`/identities`);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.balloon}>
          <img alt="balloon" src="/register/balloon.webp" />
        </div>
        <div className={styles.coconut}>
          <img alt="coconut" src="/register/coconut.webp" />
        </div>
        <div>
          <div className={styles.subtitle}>Referral</div>
          <div className={styles.title}>
            It&apos;s now time to earn
            <br />
            <span className={styles.highlight}>crypto!</span>
          </div>
        </div>
        <div>
          <div>Refer your friends to Starknet ID and earn crypto ! </div>
          <div className="font-extrabold">
            Earn up to 10$ per friends with your referral link below.
          </div>
        </div>
        <div className={styles.copyAddr} onClick={copyToClipboard}>
          {`${process.env.NEXT_PUBLIC_APP_LINK?.replace(
            "https://",
            ""
          )}/${minifyAddress(address)}`}
          {!copied ? (
            <CopyIcon width="25" color={theme.palette.secondary.main} />
          ) : (
            <DoneFilledIcon
              width="25"
              color="#fffcf8"
              secondColor={theme.palette.primary.main}
            />
          )}
        </div>
        <div>
          <Button onClick={redirect}>Go to your domain</Button>
        </div>
      </div>
      <div className={styles.coconutLeft}>
        <img alt="coconut" src="/register/coconutleft.webp" />
      </div>
      <div className={styles.coconutRight}>
        <img alt="coconut" src="/register/coconutright.webp" />
      </div>
    </>
  );
};

export default Confirmation;
