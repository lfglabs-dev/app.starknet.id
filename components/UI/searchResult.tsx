import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/search.module.css";
import SearchBadge from "./searchBadge";

type SearchResultProps = {
  search: (domain: string) => void;
  currentResult: SearchResult | null | undefined;
  history: SearchResult[];
  showHistory: boolean;
};

const SearchResult: FunctionComponent<SearchResultProps> = ({
  search,
  currentResult,
  history,
  showHistory,
}) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>();
  useEffect(() => {
    if (!history) return;
    if (!currentResult || currentResult.name === "") {
      setSearchResults(history);
      return;
    }
    const filtered = history.filter(
      (result) => result.name !== currentResult?.name
    );
    setSearchResults(
      filtered.length > 4 && currentResult?.name !== ""
        ? filtered.slice(0, 4)
        : filtered
    );
  }, [currentResult]);

  return (
    <div className={styles.results}>
      {currentResult && currentResult.name !== "" ? (
        <div
          className={styles.result}
          onClick={() => search(currentResult.name)}
        >
          <div>{currentResult.name}.stark</div>
          <SearchBadge
            error={currentResult.error}
            message={currentResult.message}
          />
        </div>
      ) : null}
      {showHistory &&
        searchResults?.map((result: SearchResult) => {
          return (
            <div className={styles.result} onClick={() => search(result.name)}>
              <div>{result.name}.stark</div>
              <SearchBadge error={result.error} message={result.message} />
            </div>
          );
        })}
    </div>
  );
};

export default SearchResult;
