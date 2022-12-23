import React from "react";
import { useRouter } from "next/router";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FunctionComponent, KeyboardEvent, useState } from "react";
import { useIsValid } from "../../hooks/naming";

type SearchBarProps = {
  // eslint-disable-next-line no-unused-vars
  onChangeTypedValue?: (typedValue: string) => void;
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  onChangeTypedValue,
}) => {
  const router = useRouter();
  const [typedValue, setTypedValue] = useState<string>("");
  const isDomainValid = useIsValid(typedValue);

  function handleChange(e: any) {
    setTypedValue(e.target.value.toLowerCase());
  }

  function onEnter(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Enter") {
      search(typedValue);
      ev.preventDefault();
    }
  }

  function search(typedValue: string) {
    if (typeof isDomainValid === "boolean") {
      onChangeTypedValue?.(typedValue);
      router.push(`/search?domain=${typedValue}`);
    }
  }

  return (
    <TextField
      fullWidth
      className="z-[0]"
      id="outlined-basic"
      label={
        isDomainValid != true
          ? `"${isDomainValid}" is not a valid character`
          : "Your Username"
      }
      placeholder="Type your .stark domain here"
      variant="outlined"
      onChange={handleChange}
      onKeyPress={(ev) => onEnter(ev)}
      InputProps={{
        endAdornment: (
          <InputAdornment
            onClick={() => search(typedValue)}
            className="cursor-pointer"
            position="end"
          >
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      error={isDomainValid != true}
    />
  );
};

export default SearchBar;
