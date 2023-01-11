import { Tooltip } from "@mui/material";
import { useStarknetCall } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStarknetIdContract } from "../../../../hooks/contracts";
import { stringToHex } from "../../../../utils/felt";
import GithubIcon from "../../../UI/iconsComponents/icons/githubIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";

type ClickableGithubIconProps = {
  color: string;
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickableGithubIcon: FunctionComponent<ClickableGithubIconProps> = ({
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
      stringToHex("github"),
      process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
    ],
  });
  const [githubId, setGithubId] = useState<string | undefined>();
  const [githubUsername, setGithubUsername] = useState<string | undefined>();

  useEffect(() => {
    if (error || !data || Number(data) === 0) return;
    setGithubId(data["data"].toString(10));
  }, [data, error]);

  useEffect(() => {
    if (githubId) {
      console.log("githubId", githubId);
      fetch(`https://api.github.com/user/${githubId}`)
        .then((response) => response.json())
        // TO DO : Find how to import the github response type
        .then((data) => {
          setGithubUsername(data.login);
        });
    }
  }, [githubId]);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  return isOwner ? (
    <Tooltip
      title={
        githubUsername
          ? `Check ${minifyDomain(domain)} github`
          : "Start github verification"
      }
      arrow
    >
      <div
        className={githubUsername ? "cursor-pointer" : styles.clickableIcon}
        onClick={
          githubUsername
            ? () => window.open(`https://github.com/${githubUsername}`)
            : () =>
                startVerification(
                  `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENTID}`
                )
        }
      >
        <GithubIcon width={width} color={githubUsername ? "black" : color} />
      </div>
    </Tooltip>
  ) : githubUsername ? (
    <Tooltip title="Check github" arrow>
      <div
        className="cursor-pointer"
        onClick={() => window.open(`https://github.com/${githubUsername}`)}
      >
        <GithubIcon width={width} color="black" />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableGithubIcon;
