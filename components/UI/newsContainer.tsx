import React, { FunctionComponent } from "react";
import styles from "../../styles/search.module.css";

type NewsContainerProps = {
  title: string;
  logo: string;
  desc: string;
  link: string;
  startDate?: string;
  endDate?: string;
};

const NewsContainer: FunctionComponent<NewsContainerProps> = ({
  title,
  logo,
  desc,
  link,
  startDate,
  endDate,
}) => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const displayNews =
    startDate &&
    endDate &&
    Number(startDate) < timestamp &&
    timestamp < Number(endDate);

  return displayNews ? (
    <div className={styles.newsContainer}>
      <div className={styles.campaignInfo}>
        <div>
          <img src={logo} width={80} className="rounded-xl" />
        </div>
        <div className="flex flex-col items-start justify-start">
          <h4 className={styles.newsTitle}>{title}</h4>
          <p className="text-xs sm:text-sm text-left">{desc}</p>
        </div>
      </div>
      <div
        className={styles.newsCallToAction}
        onClick={() => window.open(link, "_blank")}
      >
        <strong>Get it now</strong>
      </div>
    </div>
  ) : null;
};

export default NewsContainer;
