import React from "react";
import type { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import SearchBar from "../UI/searchBar";
import Timer from "../UI/timer";

type FreeRegisterPresentationProps = {
  setSearchResult: (searchResult: SearchResult) => void;
  setScreen: (screen: number) => void;
  title: { desc: string; catch: string; descAfter?: string };
  desc: string;
  image: string;
  expiry: number;
};

const FreeRegisterPresentation: FunctionComponent<
  FreeRegisterPresentationProps
> = ({ setSearchResult, setScreen, title, desc, image, expiry }) => {
  function onSearch(searchResult: SearchResult) {
    setSearchResult(searchResult);
    setScreen(2);
  }

  return (
    <div className={styles.wrapperScreen}>
      <div className={styles.containerVariant}>
        <div className="max-w-4xl flex flex-col items-start justify-start gap-5 mx-5 mb-5">
          <div className="flex flex-col lg:items-start items-center text-center sm:text-start gap-3">
            <h1 className={styles.titleVariant}>
              {title.desc} <span className="text-primary">{title.catch}</span>
              {title.descAfter && " " + title.descAfter}
            </h1>
            <p className={styles.descriptionVariant}>{desc}</p>
          </div>
          <div className={styles.searchBarVariant}>
            <SearchBar onSearch={onSearch} showHistory={false} is5LettersOnly />
          </div>
        </div>
        <div className={styles.illustrationContainerVariant}>
          <img src={image} className={styles.illustrationVariant} alt="Registration illustration" />
          <Timer expiry={expiry} fixed />
        </div>
      </div>
    </div>
  );
};

export default FreeRegisterPresentation;
