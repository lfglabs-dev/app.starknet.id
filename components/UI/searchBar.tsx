import React from "react";
import { useRouter } from "next/router";
import { TextField, styled } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useIsValid } from "../../hooks/naming";
import { usePostHog } from "posthog-js/react";
import styles from "../../styles/search.module.css";
import SearchResult from "./searchResult";
import { useNamingContract } from "../../hooks/contracts";
import { utils } from "starknetid.js";

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: "10px 35px",
    caretColor: "#454545",
    cursor: "pointer",
    "& fieldset": {
      border: "1px solid #CDCCCC",
      borderRadius: "20px",
      boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.06)",
      backgroundColor: "#FFFFFF",
      cursor: "pointer",
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
      cursor: "pointer",
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
}));

type SearchBarProps = {
  onChangeTypedValue?: (typedValue: string) => void;
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  onChangeTypedValue,
}) => {
  const router = useRouter();
  const [typedValue, setTypedValue] = useState<string>("");
  const isDomainValid = useIsValid(typedValue);
  const [currentResult, setCurrentResult] = useState<SearchResult>();
  const { contract } = useNamingContract();

  function handleChange(value: string) {
    setTypedValue(value.toLowerCase());
    const isDomainValid = useIsValid(value);
    if (isDomainValid !== true) {
      setCurrentResult({
        name: value,
        error: true,
        message: isDomainValid + " is not a valid caracter",
      });
    } else {
      const currentTimeStamp = new Date().getTime() / 1000;
      const encoded = value
        ? utils.encodeDomain(value).map((elem) => elem.toString())
        : [];
      contract &&
        contract.call("domain_to_expiry", [encoded]).then((res) => {
          if (Number(res?.["expiry"]) < currentTimeStamp) {
            setCurrentResult({
              name: value,
              error: false,
              message: "Available",
            });
          } else {
            setCurrentResult({
              name: value,
              error: true,
              message: "Unavailable",
            });
          }
        });
    }
  }

  function search(typedValue: string) {
    if (typeof isDomainValid === "boolean") {
      onChangeTypedValue?.(typedValue);
      setTypedValue("");
      router.push(`/search?domain=${typedValue}`);
    }
  }

  return (
    <div className={styles.searchContainer}>
      <CustomTextField
        fullWidth
        id="outlined-basic"
        placeholder="Search your username"
        variant="outlined"
        onChange={(e) => handleChange(e.target.value)}
        value={typedValue}
        error={isDomainValid != true}
      />
      {currentResult && typedValue.length > 0 ? (
        <SearchResult results={currentResult} search={search} />
      ) : null}
    </div>
  );
};

export default SearchBar;
