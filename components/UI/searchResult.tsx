import React, { type FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/search.module.css";
import SearchBadge from "./searchBadge";
import type { DomainSearchResult } from "./searchBar";

type SearchResultProps = {
  search: (result: DomainSearchResult) => void;
  currentResult: DomainSearchResult | null | undefined;
  history: DomainSearchResult[];
  showHistory: boolean;
};

const SearchResult: FunctionComponent<SearchResultProps> = ({
  search,
  currentResult,
  history,
  showHistory,
}) => {
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>();

  useEffect(() => {
    if (!currentResult || currentResult.name === "") {
      setSearchResults(history);
      return;
    }
    const filtered = history.filter(
      (result) => result.name !== currentResult.name
    );
    setSearchResults(
      filtered.length > 4 && currentResult.name !== ""
        ? filtered.slice(0, 4)
        : filtered
    );
  }, [currentResult, history]);

  return (
    <div className={styles.results}>
      {currentResult && currentResult.name !== "" ? (
        <div className={styles.result} onClick={() => search(currentResult)}>
          <div>{currentResult.name}.stark</div>
          <SearchBadge
            error={currentResult.error}
            message={currentResult.message}
          />
        </div>
      ) : null}
      {showHistory &&
        searchResults?.map((result) => (
          <div
            key={result.lastAccessed}
            className={styles.result}
            onClick={() => search(result)}
          >
            <div>{result.name}.stark</div>
            <SearchBadge error={result.error} message={result.message} />
          </div>
        ))}
    </div>
  );
};

export default SearchResult;
