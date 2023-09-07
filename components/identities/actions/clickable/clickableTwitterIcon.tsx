import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import TwitterIcon from "../../../UI/iconsComponents/icons/twitterIcon";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import styles from "../../../../styles/components/icons.module.css";
import theme from "../../../../styles/theme";
import { posthog } from "posthog-js";
import ClickableWarningIcon from "./clickableWarningIcon";

type ClickableTwitterIconProps = {
  width: string;
  isOwner: boolean;
  tokenId: string;
  twitterId?: string;
  domain?: string;
  needUpdate: boolean;
};

const ClickableTwitterIcon: FunctionComponent<ClickableTwitterIconProps> = ({
  width,
  twitterId,
  tokenId,
  isOwner,
  domain,
  needUpdate,
}) => {
  const router = useRouter();

  function startVerification(link: string): void {
    posthog?.capture("twitterVerificationStart");
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    needUpdate ? (
      <ClickableWarningIcon
        startVerification={() =>
          startVerification(
            `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
          )
        }
        icon={<TwitterIcon width={width} color={"white"} />}
        className={styles.clickableIconTwitter}
      />
    ) : (
      <Tooltip
        title={
          twitterId
            ? "Change your twitter account on Starknet ID"
            : "Start twitter verification"
        }
        arrow
      >
        <div
          className={styles.clickableIconTwitter}
          onClick={() =>
            startVerification(
              `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
            )
          }
        >
          {twitterId ? (
            <div className={styles.verifiedIcon}>
              <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
            </div>
          ) : null}
          <TwitterIcon width={width} color={"white"} />
        </div>
      </Tooltip>
    )
  ) : twitterId ? (
    <Tooltip title={`${domain} twitter is verified`} arrow>
      <div className={styles.unclickableIconTwitter}>
        <div className={styles.verifiedIcon}>
          <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
        </div>
        <TwitterIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableTwitterIcon;
