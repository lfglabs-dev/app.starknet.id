import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  FunctionComponent,
  useState,
  KeyboardEvent,
} from "react";
import { useRouter } from "next/router";
import { TextField, styled } from "@mui/material";
import styles from "../../styles/search.module.css";
import SearchResult from "../UI/searchResult";
import { utils } from "starknetid.js";
import { Abi, Contract, Provider } from "starknet";
import naming_abi from "../../abi/starknet/naming_abi.json";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";
import { isValidDomain, getDomainWithStark } from "../../utils/stringService";
import { useIsValid } from "../../hooks/naming";

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
    "&:hover fieldset": {
      border: "1px solid #CDCCCC",
    },
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
    "&.Mui-focused ::placeholder": {
      color: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
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
  onSearch?: (result: SearchResult) => void;
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
  const controllerRef = useRef<AbortController | null>(null);
  const latestRequestRef = useRef<number>(0);
  const [typedValue, setTypedValue] = useState<string>("");
  const isValid = useIsValid(typedValue);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const { provider } = useContext(StarknetIdJsContext);

  const contract = useMemo(() => {
    return new Contract(
      naming_abi as Abi,
      process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      provider as Provider
    );
  }, [provider]);

  useEffect(() => {
    const existingResults =
      JSON.parse(localStorage.getItem("search-history") as string) || [];
    const firstResults = existingResults.slice(0, 2);
    const resultPromises = firstResults.map(
      (result: { name: string; lastAccessed: number }) =>
        getStatus(result.name, result.lastAccessed)
    );
    Promise.all(resultPromises).then((fullResults) => {
      fullResults.sort(
        (firstResult: SearchResult, secondResult: SearchResult) =>
          secondResult.lastAccessed - firstResult.lastAccessed
      );
      setSearchResults(fullResults);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We don't add getStatus because this would cause an infinite loop

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleChange(value: string) {
    latestRequestRef.current += 1;
    setTypedValue(value.toLowerCase());
  }

  useEffect(() => {
    if (typedValue) {
      // Cancel previous request
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      // Create a new AbortController
      controllerRef.current = new AbortController();
      const currentRequest = latestRequestRef.current;

      getStatus(typedValue, undefined, controllerRef.current.signal)
        .then((result) => {
          if (currentRequest === latestRequestRef.current) {
            setCurrentResult(result);
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("An unexpected error occurred:", error);
          }
        });
    } else {
      setCurrentResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedValue]); // We won't add getStatus because this would cause an infinite loop

  async function getStatus(
    name: string,
    lastAccessed?: number,
    signal?: AbortSignal
  ): Promise<SearchResult> {
    const valid = isValidDomain(name);
    if (valid !== true) {
      return {
        name,
        error: true,
        message: valid + " is not a valid character",
        lastAccessed: lastAccessed ?? Date.now(),
      };
    } else if (is5LettersOnly && name.length < 5) {
      return {
        name,
        error: true,
        message: "Only 5 letters domains for this discount",
        lastAccessed: lastAccessed ?? Date.now(),
      };
    } else {
      const currentTimeStamp = new Date().getTime() / 1000;
      const encoded = name
        ? utils.encodeDomain(name).map((elem) => elem.toString())
        : [];
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          return reject("Aborted");
        }
        contract?.call("domain_to_data", [encoded]).then((res) => {
          if (Number(res?.["expiry"]) < currentTimeStamp) {
            resolve({
              name,
              error: false,
              message: "Available",
              lastAccessed: lastAccessed ?? Date.now(),
            });
          } else {
            resolve({
              name,
              error: true,
              message: "Unavailable",
              lastAccessed: lastAccessed ?? Date.now(),
            });
          }
        });
      });
    }
  }

  function search(result: SearchResult) {
    if (
      typeof isValidDomain(result.name) === "boolean" &&
      result?.name.length > 0
    ) {
      onChangeTypedValue?.(result.name);
      showHistory && saveSearch(result as SearchResult);
      setCurrentResult(null);
      setTypedValue("");
      onSearch
        ? !result.error
          ? onSearch(result)
          : null
        : !result.error
        ? router.push(`/register/${getDomainWithStark(result.name)}`)
        : router.push(`/search?domain=${getDomainWithStark(result.name)}`);
    }
  }

  function saveSearch(newResult: SearchResult) {
    setSearchResults((prevResults) => {
      const updatedResults = [...(prevResults || [])]; // Clone the previous results
      const existingResult = updatedResults.find(
        (result) => result.name === newResult.name
      );

      if (existingResult) {
        existingResult.lastAccessed = Date.now();
      } else {
        newResult.lastAccessed = Date.now();
        updatedResults.unshift(newResult);
      }

      updatedResults.sort((a, b) => b.lastAccessed - a.lastAccessed);
      const localStorageResults = updatedResults.map((result) => ({
        name: result.name,
        lastAccessed: result.lastAccessed,
      }));
      localStorage.setItem(
        "search-history",
        JSON.stringify(localStorageResults)
      );

      return updatedResults;
    });
  }

  function onEnter(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Enter") {
      search(currentResult as SearchResult);
      ev.preventDefault();
    }
  }

  return (
    <div className={styles.searchContainer} ref={resultsRef}>
      <CustomTextField
        fullWidth
        id="outlined-basic"
        placeholder="Search your username"
        variant="outlined"
        onChange={(e) => handleChange(e.target.value)}
        value={typedValue}
        error={isValid != true}
        onKeyDown={(ev) => onEnter(ev)}
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
