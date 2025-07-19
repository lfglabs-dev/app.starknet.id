import React from "react";
import { NextPage } from "next";
import { useAccount } from "@starknet-react/core";
import styles from "../styles/components/confirmation.module.css";
import theme from "@/styles/theme";
import CopyIcon from "@/components/UI/iconsComponents/icons/copyIcon";
import DoneFilledIcon from "@/components/UI/iconsComponents/icons/doneFilledIcon";
import { useCopyToClipboard } from "@/hooks/useCopy";
import { minifyAddress } from "@/utils/stringService";
import Button from "@/components/UI/button";
import { useRouter } from "next/router";

const SubscriptionConfirmation: NextPage = () => {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const { address } = useAccount();
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const redirect = () => {
    if (tokenId) router.push(`/identities/${tokenId}?minting=true`);
    else router.push("/identities");
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
          <div className={styles.subtitle}>Thanks</div>
        </div>
        <div>
          <div className={styles.title}>
            Your subscription is <br className="hidden sm:block" />
            <span className={styles.highlight}>active!</span>
          </div>
        </div>
        <div>
          <div>Refer your friends to Starknet ID and earn crypto ! </div>
          <div className="font-extrabold">
            Earn up to 8$ per friends with your referral link below.
          </div>
        </div>
        <div
          className={styles.copyAddr}
          onClick={() =>
            copyToClipboard(
              `${process.env.NEXT_PUBLIC_APP_LINK}?sponsor=${address}`
            )
          }
        >
          {`${process.env.NEXT_PUBLIC_APP_LINK?.replace(
            "https://",
            ""
          )}/${minifyAddress(address)}`}
          {!copied ? (
            <CopyIcon width="20" color={theme.palette.secondary.main} />
          ) : (
            <DoneFilledIcon
              width="25"
              color="#fffcf8"
              secondColor={theme.palette.primary.main}
            />
          )}
        </div>
        <div>
          <Button onClick={redirect}>GO TO YOUR DOMAIN</Button>
        </div>
        <div className={styles.coconutLeft}>
          <img alt="palm tree left" src="/visuals/leftTree.svg" />
        </div>
        <div className={styles.coconutRight}>
          <img alt="palm tree right" src="/visuals/rightTree.svg" />
        </div>
      </div>
    </>
  );
};

export default SubscriptionConfirmation;
