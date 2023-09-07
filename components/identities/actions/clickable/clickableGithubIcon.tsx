import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import GithubIcon from "../../../UI/iconsComponents/icons/githubIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import theme from "../../../../styles/theme";
import { posthog } from "posthog-js";
import ClickableWarningIcon from "./clickableWarningIcon";

type ClickableGithubIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  githubId?: string;
  domain?: string;
  needUpdate: boolean;
};

const ClickableGithubIcon: FunctionComponent<ClickableGithubIconProps> = ({
  width,
  tokenId,
  isOwner,
  githubId,
  domain,
  needUpdate,
}) => {
  const router = useRouter();
  const [githubUsername, setGithubUsername] = useState<string | undefined>();

  useEffect(() => {
    if (githubId) {
      fetch(`https://api.github.com/user/${githubId}`)
        .then((response) => response.json())
        // TO DO : Find how to import the github response type
        .then((data) => {
          setGithubUsername(data.login);
        });
    }
  }, [githubId]);

  function startVerification(link: string): void {
    posthog?.capture("githubVerificationStart");
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    needUpdate ? (
      <ClickableWarningIcon
        startVerification={() =>
          startVerification(
            `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENTID}`
          )
        }
        icon={<GithubIcon width={width} color="white" />}
        className={styles.clickableIconGithub}
      />
    ) : (
      <Tooltip
        title={
          githubUsername
            ? `Change your github account from ${githubUsername} to another one`
            : "Start github verification"
        }
        arrow
      >
        <div
          className={styles.clickableIconGithub}
          onClick={() =>
            startVerification(
              `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENTID}`
            )
          }
        >
          {githubUsername ? (
            <div className={styles.verifiedIcon}>
              <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
            </div>
          ) : null}
          <GithubIcon width={width} color={"white"} />
        </div>
      </Tooltip>
    )
  ) : githubUsername ? (
    <Tooltip title={`Check ${minifyDomain(domain ?? "")} github`} arrow>
      <div
        className={styles.clickableIconGithub}
        onClick={() => window.open(`https://github.com/${githubUsername}`)}
      >
        <div className={styles.verifiedIcon}>
          <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
        </div>
        <GithubIcon width={width} color="white" />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableGithubIcon;
