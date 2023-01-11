import { Tooltip } from "@mui/material";
import { useStarknetCall } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStarknetIdContract } from "../../../../hooks/contracts";
import { stringToHex } from "../../../../utils/felt";
import DiscordIcon from "../../../UI/iconsComponents/icons/discordIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";

type ClickableDiscordIconProps = {
  color: string;
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickableDiscordIcon: FunctionComponent<ClickableDiscordIconProps> = ({
  width,
  color,
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
    <Tooltip
      title={
        DiscordId
          ? `Check ${minifyDomain(domain)} discord`
          : "Start Discord verification"
      }
      arrow
    >
      <div
        className={DiscordId ? "cursor-pointer" : styles.clickableIcon}
        onClick={
          DiscordId
            ? () => window.open(`https://discord.com/channels/@me/${DiscordId}`)
            : () =>
                startVerification(
                  "https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=https%3A%2F%2Fgoerli.app.starknet.id%2Fdiscord&response_type=code&scope=identify"
                )
        }
      >
        <DiscordIcon width={width} color={DiscordId ? "#7289d9" : color} />
      </div>
    </Tooltip>
  ) : DiscordId ? (
    <Tooltip title="Check Discord" arrow>
      <div
        className="cursor-pointer"
        onClick={() =>
          window.open(`https://discord.com/channels/@me/${DiscordId}`)
        }
      >
        <DiscordIcon width={width} color={"#7289d9"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableDiscordIcon;
