import { Tooltip } from "@mui/material";
import { useStarknetCall } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStarknetIdContract } from "../../../../hooks/contracts";
import { stringToHex } from "../../../../utils/feltService";
import DiscordIcon from "../../../UI/iconsComponents/icons/discordIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";

type ClickableDiscordIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickableDiscordIcon: FunctionComponent<ClickableDiscordIconProps> = ({
  width,
  tokenId,
  isOwner,
  domain,
}) => {
  const router = useRouter();
  const { contract } = useStarknetIdContract();
  const { data, error } = useStarknetCall({
    contract: contract,
    method: "get_verifier_data",
    args: [
      router.query.tokenId,
      stringToHex("discord"),
      process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
    ],
  });
  const [discordId, setDiscordId] = useState<string | undefined>();

  useEffect(() => {
    if (error || !data || Number(data) === 0) return;

    setDiscordId(data["data"].toString(10));
  }, [data, error]);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    <Tooltip
      title={
        discordId
          ? "Change your discord verified account"
          : "Start Discord verification"
      }
      arrow
    >
      <div
        className={styles.clickableIconDiscord}
        onClick={() =>
          startVerification(
            `https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}%2Fdiscord&response_type=code&scope=identify`
          )
        }
      >
        {discordId ? (
          <div className={styles.verifiedIcon}>
            <VerifiedIcon width={width} color={"green"} />
          </div>
        ) : null}
        <DiscordIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : discordId ? (
    <Tooltip title={`Check ${minifyDomain(domain)} discord`} arrow>
      <div
        className={styles.clickableIconDiscord}
        onClick={() =>
          window.open(`https://discord.com/channels/@me/${discordId}`)
        }
      >
        <DiscordIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableDiscordIcon;
