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
import styles from "../../styles/home.module.css";
import { usePricingContract } from "../../hooks/contracts";
import {
  useStarknet,
  useStarknetCall,
  // useStarknetExecute,
} from "@starknet-react/core";
import { stringToFelt } from "../../utils/felt";
import { Call } from "starknet";
import { useStarknetExecute } from "@starknet-react/core";
import { useEncoded } from "../../hooks/naming";

type RegisterProps = {
  domain: string;
  isAvailable?: boolean;
};

type Identity = {
  token_id: number;
  image_uri: string;
};

type starknetExecute = {
  calls?: Call | Call[];
  metadata?: any;
};

const Register: FunctionComponent<RegisterProps> = ({
  domain,
  isAvailable,
}) => {
  const maxYearsToRegister = 25;
  const [targetAddress, setTargetAddress] = useState<string>(""); // mettre la get caller address par défaut
  const [duration, setDuration] = useState<number>(20);
  const [tokenId, setTokenId] = useState<number>(0);
  const [ownedIdentities, setOwnedIdentities] = useState<any>([]);
  const [price, setPrice] = useState<number | any>(
    "0x10000000000000000000000000000000000000000000000000000000000000"
  );
  const { contract } = usePricingContract();
  const { data: priceData, error: priceError } = useStarknetCall({
    contract: contract,
    method: "compute_buy_price",
    args: [stringToFelt(domain), duration * 365],
  });
  const { account } = useStarknet();
  const encodedDomain = useEncoded(domain);

  const { data, error, execute } = useStarknetExecute({
    calls: [
      // {
      //   contractAddress:
      //     "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      //   entrypoint: "approve",
      //   calldata: [
      //     "0x020ca36ee7cf524e41dfbb8e8f22b60af47e63678bd5dc24acf72b674d1ddc08",
      //     price,
      //     0,
      //   ],
      // },

      {
        contractAddress:
          "0x020ca36ee7cf524e41dfbb8e8f22b60af47e63678bd5dc24acf72b674d1ddc08",
        entrypoint: "buy",
        calldata: [tokenId, 0, encodedDomain, duration * 365, account],
      },
    ],
  });

  console.log("err", error, account);

  // const { data, loading, error, reset, execute } = useStarknetExecute({
  //   calls,
  //   metadata,
  // });

  useEffect(() => {
    if (priceError || !priceData) {
      setPrice(0);
    } else {
      setPrice(priceData?.["price"].low.words[0] / (10 ^ 18));
    }
  }, [priceData, priceError]);

  useEffect(() => {
    if (account) {
      setTargetAddress(account);
      fetch(
        `https://api-testnet.aspect.co/api/v0/assets?contract_address=0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b&owner_address=${account}&sort_by=minted_at&order_by=desc`
      )
        .then((response) => response.json())
        .then((data) => setOwnedIdentities(data.assets));
    }
  }, [account]);

  function changeAddress(e: any): void {
    setTargetAddress(e.target.value);
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
              defaultValue={ownedIdentities[0]?.token_id}
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
                    src="/visuals/starknetIdLogo.png"
                    alt="starknet.id avatar"
                  />
                </ListItemIcon>
                <ListItemText primary="Mint a new starknet.id" />
              </MenuItem>
              {ownedIdentities.map((identity: Identity, index: number) => (
                <MenuItem key={index} value={identity.token_id}>
                  <ListItemIcon>
                    <img
                      width={"25px"}
                      src={identity.image_uri}
                      alt="starknet.id avatar"
                    />
                  </ListItemIcon>
                  <ListItemText primary={identity.token_id} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Choose the starknet identity you want to link with your domain
            </FormHelperText>
          </FormControl>
        </div>

        <div className={styles.cardCenter}>
          <p>Price Approximation : 0 ETH</p>
        </div>
        <div className="text-beige mt-5">
          <Button
            onClick={() => {
              execute();
            }}
            disabled={
              !Boolean(account) || !duration || !targetAddress || !tokenId
            }
          >
            Register
          </Button>
        </div>
      </div>
    );

  return <p>This domain is not available you can&rsquo;t register it</p>;
};

export default Register;
