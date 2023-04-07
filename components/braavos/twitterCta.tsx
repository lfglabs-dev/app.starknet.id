import React, { FunctionComponent } from "react";
import styles from "../../styles/braavos.module.css";
import Button from "../UI/button";
import TwitterIcon from "../UI/iconsComponents/icons/twitterIcon";

type TwitterCtaProps = {
  domain: string;
};

const TwitterCta: FunctionComponent<TwitterCtaProps> = ({ domain }) => (
  <>
    <h1 className="title">Tweet your achievement !</h1>
    <div className={styles.sbtContainer}>
      <div className={styles.sbtImageContainer}>
        <TwitterIcon width={"250"} color="#55ACEE" />
      </div>
    </div>
    <div className="max-w-sm">
      <Button
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?text=Just%20minted%20a%20Silver%20Shield%20of%20Braavos%20with%20my%20domain%20${domain}%20%F0%9F%9B%A1%EF%B8%8F%0A%0AGo%20mint%20yours%20for%20free%20on%20app.starknet.id%2Fbraavos%20if%20you%20already%20have%20a%20stark%20domain%20or%20subdomain%20!%0A%0ABe%20quick%2C%20it%20might%20not%20last%20forever%20%F0%9F%91%80`
          )
        }
      >
        TWEET MY ACHIEVEMENT
      </Button>
    </div>
  </>
);

export default TwitterCta;
