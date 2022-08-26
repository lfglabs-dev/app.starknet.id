import { FunctionComponent, useState } from "react";
import styles from "../../styles/home.module.css";
import DiscordIcon from "../UI/icons/discordIcon";
import TwitterIcon from "../UI/icons/twitterIcon";
import GithubIcon from "../UI/icons/githubIcon";

type SubdomainProps = {
  domain: string;
  isAvailable?: boolean;
};

const Details: FunctionComponent<SubdomainProps> = ({
  domain,
  isAvailable,
}) => {
  const isThereSubdomains = false;

  if (isThereSubdomains)
    return (
      <div className="sm:w-2/3 w-4/5 break-all">
        <p>flores.ben.stark</p>
        <p>
          <strong>Owner :</strong>&nbsp;
          0x072d4f3fA4661228Ed0C9872007Fc7E12a581E000FAd7B8f3e3e5Bf9e6133207
        </p>
        <p>
          <strong>Points to :</strong>&nbsp;
          0x072d4f3fA4661228Ed0C9872007Fc7E12a581E000FAd7B8f3e3e5Bf9e6133207
        </p>
      </div>
    );

  return (
    <div className="flex justify-center align-center mt-2">
      <p>There is no subdomain</p>
    </div>
  );
};

export default Details;
