import { FunctionComponent, useState } from "react";
import styles from "../../styles/home.module.css";
import DiscordIcon from "../UI/icons/discordIcon";
import TwitterIcon from "../UI/icons/twitterIcon";
import GithubIcon from "../UI/icons/githubIcon";

type DetailsProps = {
  domain: string;
  isAvailable: boolean;
};

const Details: FunctionComponent<DetailsProps> = ({ domain, isAvailable }) => {
  if (isAvailable)
    return (
      <div className="sm:w-2/3 w-4/5 break-all">
        <p>
          <strong>Owner :</strong>&nbsp;
          0x072d4f3fA4661228Ed0C9872007Fc7E12a581E000FAd7B8f3e3e5Bf9e6133207
        </p>
        <p>
          <strong>Points to :</strong>&nbsp;
          0x072d4f3fA4661228Ed0C9872007Fc7E12a581E000FAd7B8f3e3e5Bf9e6133207
        </p>
        <div className="flex justify-center align-center mt-2">
          <div className="m-2">
            <DiscordIcon color="#19aa6e" width={"25"} />
          </div>
          <div className="m-2">
            <TwitterIcon color="#19aa6e" width={"25"} />
          </div>
          <div className="m-2">
            <GithubIcon color="#19aa6e" width={"25"} />
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.cardCenter}>
      <p>This domain is available so there is no data attached to it</p>
    </div>
  );
};

export default Details;
