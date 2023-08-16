import { FunctionComponent } from "react";
import styles from "../../styles/search.module.css";
import SearchBadge from "./searchBadge";

type SearchResultProps = {
  search: (domain: string) => void;
  results: SearchResult;
};

const SearchResult: FunctionComponent<SearchResultProps> = ({
  search,
  results,
}) => {
  return (
    <div className={styles.results}>
      <div className={styles.result} onClick={() => search(results.name)}>
        <div>{results.name}.stark</div>
        <SearchBadge error={results.error} message={results.message} />
      </div>
    </div>
  );
};

export default SearchResult;
