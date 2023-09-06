import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import homeStyles from "../../styles/Home.module.css";
import SearchBar from "../UI/searchBar";
import Timer from "../UI/timer";

type DiscountOfferScreenProps = {
  setSearchResult: (searchResult: SearchResult) => void;
  setScreen: (screen: number) => void;
  title: { desc: string; catch: string };
  desc: string;
  image: string;
  expiry: number;
};

const DiscountOfferScreen: FunctionComponent<DiscountOfferScreenProps> = ({
  setSearchResult,
  setScreen,
  title,
  desc,
  image,
  expiry,
}) => {
  function onSearch(searchResult: SearchResult) {
    setSearchResult(searchResult);
    setScreen(2);
  }
  return (
    <div className={homeStyles.wrapperScreen}>
      <div className={styles.container}>
        <div className={styles.illustrationContainer}>
          <img src={image} className={styles.illustration} />
          <Timer expiry={expiry} fixed />
        </div>
        <div className="max-w-xl flex flex-col items-start justify-start gap-5 mx-5 mb-5">
          <div className="flex flex-col lg:items-start items-center text-center sm:text-start gap-3">
            <h1 className={styles.title}>
              {title.desc}
              <br />
              <span className="text-primary">{title.catch}</span>
            </h1>
            <p className={styles.description}>{desc}</p>
          </div>

          <SearchBar
            onSearch={onSearch}
            is5LettersOnly={true}
            showHistory={false}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountOfferScreen;
