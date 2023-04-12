import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import DiscordIcon from "../../../UI/iconsComponents/icons/discordIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";

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
  const [discordId, setDiscordId] = useState<string | undefined>();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(parseInt(tokenId), "discord")
      .then((response) => {
        if (response.toString(10) !== "0") {
          setDiscordId(response.toString(10));
        }
      })
      .catch(() => {
        return;
      });
  }, [starknetIdNavigator]);

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
