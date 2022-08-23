import { useStarknet } from "@starknet-react/core";
import { useRouter } from "next/router";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FunctionComponent, KeyboardEvent, useState } from "react";

// type SearchBarProps = {
//   context: string;
// };

const SearchBar: FunctionComponent = () => {
  const router = useRouter();
  const [typedValue, setTypedValue] = useState<string>("");

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
    router.push(`/search?value=${typedValue}`);
  }

  return (
    <TextField
      fullWidth
      className="z-[0]"
      id="outlined-basic"
      label="You username"
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
    />
  );
};

export default SearchBar;
