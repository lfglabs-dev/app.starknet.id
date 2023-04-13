import React, { FunctionComponent } from "react";
import styles from "../../styles/braavos.module.css";
import Button from "../UI/button";
import TwitterIcon from "../UI/iconsComponents/icons/twitterIcon";

type TwitterCtaProps = {
  twitterLink: string;
};

const TwitterCta: FunctionComponent<TwitterCtaProps> = ({ twitterLink }) => (
  <>
    <h1 className="title">Tweet your achievement !</h1>
    <div className={styles.sbtContainer}>
      <div className={styles.sbtImageContainer}>
        <TwitterIcon width={"250"} color="#55ACEE" />
      </div>
    </div>
    <div className="max-w-sm">
      <Button onClick={() => window.open(twitterLink)}>
        TWEET MY ACHIEVEMENT
      </Button>
    </div>
  </>
);

export default TwitterCta;
