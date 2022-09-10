/* eslint-disable @next/next/no-img-element */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import styles from "../../styles/Home.module.css";
import {
  starknetIdContract,
  usePricingContract,
  etherContract,
  namingContract,
} from "../../hooks/contracts";
import {
  useStarknet,
  useStarknetCall,
  // useStarknetExecute,
} from "@starknet-react/core";
import { hexToFelt, stringToFelt } from "../../utils/felt";
import { Call } from "starknet";
import { useStarknetExecute } from "@starknet-react/core";
import { useEncoded } from "../../hooks/naming";
import BN from "bn.js";
import { isHexString } from "../../hooks/string";

type RegisterProps = {
  domain: string;
  isAvailable?: boolean;
};

const Register: FunctionComponent<RegisterProps> = ({
  domain,
  isAvailable,
}) => {
  const maxYearsToRegister = 25;
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [duration, setDuration] = useState<number>(20);
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<any>([]);
  const [ownedIdentities, setOwnedIdentities] = useState<number[] | []>([]);
  const [price, setPrice] = useState<string>("0");
  const { contract } = usePricingContract();
  const { data: priceData, error: priceError } = useStarknetCall({
    contract: contract,
    method: "compute_buy_price",
    args: [stringToFelt(domain), duration * 365],
  });
  const { account } = useStarknet();
  const encodedDomain = useEncoded(domain);
  const { data, error, execute } = useStarknetExecute({
    calls: callData,
  });

  useEffect(() => {
    if (priceError || !priceData) setPrice("0");
    else setPrice(new BN(priceData?.["price"].low.words[0]).toString(10));
  }, [priceData, priceError]);

  useEffect(() => {
    if (account) {
      setTargetAddress(account);
      fetch(
        `https://goerli.indexer.starknet.id/addr_to_available_ids?addr=${hexToFelt(
          account
        )?.replace("0x", "")}`
      )
        .then((response) => response.json())
        .then((data) => setOwnedIdentities(data.ids));
    }
  }, [account]);

  useEffect(() => {
    if (!isAvailable) return;
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (tokenId != 0) {
      setCallData([
        {
          contractAddress: etherContract,
          entrypoint: "approve",
          calldata: [namingContract, price, 0],
        },
        {
          contractAddress: namingContract,
          entrypoint: "buy",
          calldata: [
            new BN(tokenId).toString(10),
            "0",
            new BN(encodedDomain).toString(10),
            new BN(duration * 365).toString(10),
            new BN(targetAddress?.slice(2), 16).toString(10),
          ],
        },
      ]);
    } else {
      setCallData([
        {
          contractAddress: etherContract,
          entrypoint: "approve",
          calldata: [namingContract, price, 0],
        },
        {
          contractAddress: starknetIdContract,
          entrypoint: "mint",
          calldata: [new BN(newTokenId).toString(10), "0"],
        },
        {
          contractAddress: namingContract,
          entrypoint: "buy",
          calldata: [
            new BN(newTokenId).toString(10),
            "0",
            new BN(encodedDomain).toString(10),
            new BN(duration * 365).toString(10),
            new BN(targetAddress?.slice(2), 16).toString(10),
          ],
        },
      ]);
    }
  }, [tokenId, duration, targetAddress, isAvailable, price, domain]);

  function changeAddress(e: any): void {
    isHexString(e.target.value) ? setTargetAddress(e.target.value) : null;
  }

  function changeDuration(e: any): void {
    setDuration(e.target.value);
  }

  function changeTokenId(e: any): void {
    setTokenId(Number(e.target.value));
  }

  if (isAvailable)
    return (
      <div className="sm:w-full w-2/3">
        <div className="flex">
          <div className="mr-1 z-[0] w-1/2">
            <TextField
              fullWidth
              label="Target address"
              id="outlined-basic"
              value={targetAddress ?? "0x.."}
              variant="outlined"
              onChange={changeAddress}
              color="secondary"
              required
            />
          </div>
          <div className="mr-1 z-[0] w-1/2">
            <TextField
              fullWidth
              className="ml-1 z-[0]"
              id="outlined-basic"
              label="years"
              type="number"
              placeholder="years"
              variant="outlined"
              onChange={changeDuration}
              InputProps={{
                inputProps: { min: 0, max: maxYearsToRegister },
              }}
              defaultValue={duration}
              color="secondary"
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <FormControl fullWidth>
            <InputLabel>Starknet.id</InputLabel>
            <Select
              value={tokenId}
              defaultValue={ownedIdentities[0]}
              label="Starknet.id"
              onChange={changeTokenId}
              sx={{
                "& .MuiSelect-select": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value={0}>
                <ListItemIcon>
                  <img
                    width={"25px"}
                    src="/visuals/StarknetIdLogo.png"
                    alt="starknet.id avatar"
                  />
                </ListItemIcon>
                <ListItemText primary="Mint a new starknet.id" />
              </MenuItem>
              {ownedIdentities.map((tokenId: number, index: number) => (
                <MenuItem key={index} value={tokenId}>
                  <ListItemIcon>
                    <img
                      width={"25px"}
                      src={`https://www.starknet.id/api/identicons/${tokenId}`}
                      alt="starknet.id avatar"
                    />
                  </ListItemIcon>
                  <ListItemText primary={tokenId} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Choose the starknet identity you want to link with your domain
            </FormHelperText>
          </FormControl>
        </div>

        <div className={styles.cardCenter}>
          <p>Price : {price} wei</p>
        </div>
        <div className="text-beige mt-5">
          <Button
            onClick={() => {
              execute();
            }}
            disabled={!Boolean(account) || !duration || !targetAddress}
          >
            Register
          </Button>
        </div>
      </div>
    );

  return <p>This domain is not available you can&rsquo;t register it</p>;
};

export default Register;
