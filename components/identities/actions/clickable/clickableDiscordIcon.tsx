import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import DiscordIcon from "../../../UI/iconsComponents/icons/discordIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import theme from "../../../../styles/theme";
import { posthog } from "posthog-js";
import ClickableWarningIcon from "./clickableWarningIcon";

type ClickableDiscordIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  discordId?: string;
  domain?: string;
  needUpdate: boolean;
};

const ClickableDiscordIcon: FunctionComponent<ClickableDiscordIconProps> = ({
  width,
  tokenId,
  isOwner,
  domain,
  discordId,
  needUpdate,
}) => {
  const router = useRouter();

  function startVerification(link: string): void {
    posthog?.capture("discordVerificationStart");
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    needUpdate ? (
      <ClickableWarningIcon
        startVerification={() =>
          startVerification(
            `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}%2Fdiscord&response_type=code&scope=identify`
          )
        }
        icon={<DiscordIcon width={"18"} color={"white"} />}
        className={styles.clickableIconDiscord}
      />
    ) : (
      <Tooltip
        title={
          discordId
            ? `Change your discord account from the account ${discordId} to another one`
            : "Start Discord verification"
        }
        arrow
      >
        <div
          className={styles.clickableIconDiscord}
          onClick={() =>
            startVerification(
              `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}%2Fdiscord&response_type=code&scope=identify`
            )
          }
        >
          {discordId ? (
            <div className={styles.verifiedIcon}>
              <VerifiedIcon width={width} color={theme.palette.primary.main} />
            </div>
          ) : null}
          <DiscordIcon width={"18"} color={"white"} />
        </div>
      </Tooltip>
    )
  ) : discordId ? (
    <Tooltip title={`${minifyDomain(domain ?? "")} discord is verified`} arrow>
      <div className={styles.unclickableIconDiscord}>
        <div className={styles.verifiedIcon}>
          <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
        </div>
        <DiscordIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableDiscordIcon;
