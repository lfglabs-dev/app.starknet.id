import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import TwitterIcon from "../../../UI/iconsComponents/icons/twitterIcon";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";

type ClickableTwitterIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickableTwitterIcon: FunctionComponent<ClickableTwitterIconProps> = ({
  width,
  tokenId,
  isOwner,
  domain,
}) => {
  const router = useRouter();
  const [twitterId, setTwitterId] = useState<string | undefined>();
  const [twitterUsername, setTwitterUsername] = useState<string | undefined>();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(parseInt(tokenId), "twitter")
      .then((response) => {
        if (response.toString(10) !== "0") {
          setTwitterId(response.toString(10));
        }
      })
      .catch(() => {
        return;
      });
  }, []);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  useEffect(() => {
    if (twitterId) {
      fetch(`/api/twitter/get_username?id=${twitterId}`)
        .then((response) => response.json())
        // TO DO : Find how to import the twitter response type
        .then((data) => {
          setTwitterUsername(data[0].username);
        });
    }
  }, [twitterId]);

  return isOwner ? (
    <Tooltip
      title={
        twitterUsername
          ? "Change your twitter verified account"
          : "Start twitter verification"
      }
      arrow
    >
      <div
        className={styles.clickableIconTwitter}
        onClick={() =>
          startVerification(
            `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=Rkp6QlJxQzUzbTZtRVljY2paS0k6MTpjaQ&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
          )
        }
      >
        {twitterUsername ? (
          <div className={styles.verifiedIcon}>
            <VerifiedIcon width={width} color={"green"} />
          </div>
        ) : null}
        <TwitterIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : twitterUsername ? (
    <Tooltip title={`Check ${minifyDomain(domain)} twitter`} arrow>
      <div
        className={styles.clickableIconTwitter}
        onClick={() => window.open(`https://twitter.com/${twitterUsername}`)}
      >
        <TwitterIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableTwitterIcon;
