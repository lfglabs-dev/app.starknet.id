import { useRouter } from "next/router";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FunctionComponent, KeyboardEvent, useEffect, useState } from "react";
import { useIsValid } from "../../hooks/naming";

type SearchBarProps = {
  onChangeTypedValue?: (typedValue: string) => void;
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  onChangeTypedValue,
}) => {
  const router = useRouter();
  const [typedValue, setTypedValue] = useState<string>("");
  const domainEncoded = useIsValid(typedValue);

  function handleChange(e: any) {
    setTypedValue(e.target.value);
  }

  function onEnter(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Enter") {
      search(typedValue);
      ev.preventDefault();
    }
  }

  function search(typedValue: string) {
    if (typeof domainEncoded === "boolean") {
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
        domainEncoded != true
          ? `"${domainEncoded}" is not a valid character`
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
      error={domainEncoded != true}
    />
  );
};

export default SearchBar;
