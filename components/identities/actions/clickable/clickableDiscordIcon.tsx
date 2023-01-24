import { Tooltip } from "@mui/material";
import { useStarknetCall } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStarknetIdContract } from "../../../../hooks/contracts";
import { stringToHex } from "../../../../utils/felt";
import DiscordIcon from "../../../UI/iconsComponents/icons/discordIcon";
import styles from "../../../../styles/components/icons.module.css";

type ClickableDiscordIconProps = {
  color: string;
  width: string;
  tokenId: string;
  isOwner: boolean;
};

const ClickableDiscordIcon: FunctionComponent<ClickableDiscordIconProps> = ({
  width,
  color,
  tokenId,
  isOwner,
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
  const [DiscordId, setDiscordId] = useState<string | undefined>();

  useEffect(() => {
    if (error || !data || Number(data) === 0) return;

    setDiscordId(data["data"].toString(10));
  }, [data, error]);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    <Tooltip title={"Start Discord verification"} arrow>
      <div
        className={styles.clickableIcon}
        onClick={() =>
          startVerification(
            `https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}%2Fdiscord&response_type=code&scope=identify`
          )
        }
      >
        <DiscordIcon width={width} color={color} />
      </div>
    </Tooltip>
  ) : DiscordId ? (
    <Tooltip
      title="A discord account is linked to your identity, click to change it"
      arrow
    >
      <div
        className="cursor-pointer"
        onClick={() =>
          startVerification(
            `https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}%2Fdiscord&response_type=code&scope=identify`
          )
        }
      >
        <DiscordIcon width={width} color={"#7289d9"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableDiscordIcon;
