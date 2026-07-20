import React, {
  type FunctionComponent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { TextField, styled } from "@mui/material";
import styles from "../../styles/search.module.css";
import SearchResult from "../UI/searchResult";
import { readDomainExpiry } from "@/lib/chain/contracts";
import { normalizeDomain } from "@/lib/chain/domain";

export type DomainSearchResult = {
  name: string;
  error: boolean;
  message: string;
  lastAccessed: number;
};

const BASIC_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789-";

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: "10px 35px",
    caretColor: "#454545",
    "& fieldset": {
      border: "1px solid #CDCCCC",
      borderRadius: "20px",
      boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.06)",
      backgroundColor: "#FFFFFF",
    },
    "& .MuiInputBase-input": {
      color: "#454545",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      letterSpacing: "0.24px",
      textAlign: "center",
      zIndex: "1",
    },
    "&:hover fieldset": { border: "1px solid #CDCCCC" },
    "& ::placeholder": {
      color: "#B0AEAE",
      textAlign: "center",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      letterSpacing: "0.24px",
      justifyContent: "center",
      alignItems: "center",
    },
    "&.Mui-focused ::placeholder": { color: "transparent" },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiOutlinedInput-root": {
      padding: "0 30px",
      "& .MuiInputBase-input": {
        fontSize: "22px",
        lineHeight: "22px",
        letterSpacing: "0.2px",
      },
      "& ::placeholder": {
        fontSize: "16px",
        lineHeight: "20px",
        letterSpacing: "0.2px",
      },
    },
  },
}));

type SearchBarProps = {
  onChangeTypedValue?: (typedValue: string) => void;
  showHistory: boolean;
  onSearch?: (result: DomainSearchResult) => void;
  is5LettersOnly?: boolean;
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  onChangeTypedValue,
  showHistory,
  onSearch,
  is5LettersOnly = false,
}) => {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const latestRequestRef = useRef(0);
  const [typedValue, setTypedValue] = useState("");
  const invalidCharacter = Array.from(typedValue).find(
    (character) => !BASIC_ALPHABET.includes(character)
  );
  const [currentResult, setCurrentResult] =
    useState<DomainSearchResult | null>();
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  async function getStatus(
    name: string,
    lastAccessed?: number
  ): Promise<DomainSearchResult> {
    const invalid = Array.from(name).find(
      (character) => !BASIC_ALPHABET.includes(character)
    );
    if (invalid) {
      return {
        name,
        error: true,
        message: `${invalid} is not a valid character`,
        lastAccessed: lastAccessed ?? Date.now(),
      };
    }
    if (is5LettersOnly && name.length < 5) {
      return {
        name,
        error: true,
        message: "Only 5 letters domains for this discount",
        lastAccessed: lastAccessed ?? Date.now(),
      };
    }
    const expiry = await readDomainExpiry(normalizeDomain(name));
    const available = Number(expiry) < Date.now() / 1000;
    return {
      name,
      error: !available,
      message: available ? "Available" : "Unavailable",
      lastAccessed: lastAccessed ?? Date.now(),
    };
  }

  useEffect(() => {
    let existingResults: { name: string; lastAccessed: number }[] = [];
    try {
      existingResults =
        JSON.parse(localStorage.getItem("search-history") as string) || [];
    } catch {
      localStorage.removeItem("search-history");
    }
    const firstResults = existingResults.slice(0, 2);
    Promise.all(
      firstResults.map((result) =>
        getStatus(result.name, result.lastAccessed)
      )
    ).then((fullResults) => {
      fullResults.sort(
        (firstResult, secondResult) =>
          secondResult.lastAccessed - firstResult.lastAccessed
      );
      setSearchResults(fullResults);
    });
    // Search history is hydrated once, as in the original component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      } else {
        setShowResults(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    latestRequestRef.current += 1;
    setTypedValue(value.toLowerCase());
  }

  useEffect(() => {
    if (!typedValue) {
      setCurrentResult(null);
      return;
    }
    const currentRequest = latestRequestRef.current;
    void getStatus(typedValue)
      .then((result) => {
        if (currentRequest === latestRequestRef.current) {
          setCurrentResult(result);
        }
      })
      .catch((error) => console.error("An unexpected error occurred:", error));
    // Status lookup intentionally follows only the typed value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedValue]);

  function search(result: DomainSearchResult) {
    const valid = !Array.from(result.name).some(
      (character) => !BASIC_ALPHABET.includes(character)
    );
    if (valid && result.name.length > 0) {
      onChangeTypedValue?.(result.name);
      if (showHistory) saveSearch(result);
      setCurrentResult(null);
      setTypedValue("");
      if (onSearch) {
        if (!result.error) onSearch(result);
      } else if (!result.error) {
        void router.push(`/register/${result.name}.stark`);
      } else {
        void router.push(`/search?domain=${result.name}.stark`);
      }
    }
  }

  function saveSearch(newResult: DomainSearchResult) {
    setSearchResults((previousResults) => {
      const updatedResults = [...previousResults];
      const existingResult = updatedResults.find(
        (result) => result.name === newResult.name
      );
      if (existingResult) existingResult.lastAccessed = Date.now();
      else {
        newResult.lastAccessed = Date.now();
        updatedResults.unshift(newResult);
      }
      updatedResults.sort((left, right) => right.lastAccessed - left.lastAccessed);
      localStorage.setItem(
        "search-history",
        JSON.stringify(
          updatedResults.map(({ name, lastAccessed }) => ({
            name,
            lastAccessed,
          }))
        )
      );
      return updatedResults;
    });
  }

  function onEnter(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && currentResult) {
      search(currentResult);
      event.preventDefault();
    }
  }

  return (
    <div className={styles.searchContainer} ref={resultsRef}>
      <CustomTextField
        fullWidth
        id="outlined-basic"
        placeholder="Search your username"
        variant="outlined"
        onChange={(event) => handleChange(event.target.value)}
        value={typedValue}
        error={Boolean(invalidCharacter)}
        onKeyDown={onEnter}
        autoComplete="off"
      />
      {showResults && (typedValue.length > 0 || searchResults.length > 0) ? (
        <SearchResult
          currentResult={currentResult}
          history={searchResults}
          search={search}
          showHistory={showHistory}
        />
      ) : null}
    </div>
  );
};

export default SearchBar;
