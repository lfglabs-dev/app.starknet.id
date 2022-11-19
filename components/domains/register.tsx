/* eslint-disable @next/next/no-img-element */
import { TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import styles from "../../styles/Home.module.css";
import {
  starknetIdContract,
  usePricingContract,
  etherContract,
  namingContract,
  L1buyingContract,
} from "../../hooks/contracts";
import { useAccount, useStarknetCall } from "@starknet-react/core";
import { useStarknetExecute } from "@starknet-react/core";
import { useEncoded } from "../../hooks/naming";
import BN from "bn.js";
import { isHexString } from "../../hooks/string";
import { ethers } from "ethers";
import L1buying_abi from "../../abi/L1/L1Buying_abi.json";
import SelectDomain from "./selectDomains";

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
  const [duration, setDuration] = useState<number>(5);
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<any>([]);
  const [price, setPrice] = useState<string>("0");
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState<number>(
    Math.round(getPriceFromDomain(domain) * 1000) / 1000
  );
  const { contract } = usePricingContract();
  const encodedDomain = useEncoded(domain);
  const { data: priceData, error: priceError } = useStarknetCall({
    contract: contract,
    method: "compute_buy_price",
    args: [encodedDomain, duration * 365],
  });
  const { account } = useAccount();
  const { execute } = useStarknetExecute({
    calls: callData,
  });

  useEffect(() => {
    if (priceError || !priceData) setPrice("0");
    else {
      setPrice(
        priceData?.["price"].low
          .add(priceData?.["price"].high.mul(new BN(2).pow(new BN(128))))
          .toString(10)
      );
    }
  }, [priceData, priceError]);

  useEffect(() => {
    setPriceWithoutDiscount(
      Math.round(duration * getPriceFromDomain(domain) * 1000) / 1000
    );
  }, [duration]);

  useEffect(() => {
    if (account) {
      setTargetAddress(account.address);
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
            new BN(encodedDomain).toString(10),
            new BN(duration * 365).toString(10),
            0,
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
          calldata: [new BN(newTokenId).toString(10)],
        },
        {
          contractAddress: namingContract,
          entrypoint: "buy",
          calldata: [
            new BN(newTokenId).toString(10),
            new BN(encodedDomain).toString(10),
            new BN(duration * 365).toString(10),
            0,
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

  // Change price
  function getPriceFromDomain(domain: string): number {
    switch (domain.length) {
      case 1:
        return 0.39;
      case 2:
        return 0.374;
      case 3:
        return 0.34;
      case 4:
        return 0.085;
      default:
        return 0.009;
    }
  }

  //TO DO régler bug safari (du provider)

  // register from L1
  const [L1Signer, setL1Signer] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  useEffect(() => {
    if (!provider) {
      setProvider(new ethers.providers.Web3Provider((window as any).ethereum));
    }
  }, [provider]);

  async function L1connect() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5' }],
      });
    } catch (switchError) {
      if ((switchError as any).code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x5",
            rpcUrls: ["https://goerli.infura.io/v3/"],
            chainName: "Goerli",
            nativeCurrency: {
              name: "GoerliETH",
              symbol: "tETH",
              decimals: 18
            },
            blockExplorerUrls: ["https://goerli.etherscan.io/"]
          }]
        });
      }
    }

    await provider?.send("eth_requestAccounts", []);

    const signer = provider?.getSigner();
    console.log(provider, signer)

    setL1Signer(signer);
  }

  async function L1register() {
    const L1buyingContract_rw = new ethers.Contract(
      L1buyingContract,
      L1buying_abi,
      L1Signer
    );
    console.log(L1buyingContract_rw)
    await L1buyingContract_rw.purchase(
      encodedDomain,
      tokenId,
      duration,
      0,
      targetAddress
    );
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
        <SelectDomain tokenId={tokenId} changeTokenId={changeTokenId} />
        <div className={styles.cardCenter}>
          <p className="text">
            Price :{" "}
            {duration >= 3 ? (
              <span className="line-through text-soft-brown">{`${priceWithoutDiscount} ETH`}</span>
            ) : null}
            &nbsp;
            <span className="font-semibold text-brown">
              {Math.round(Number(price) * 0.000000000000000001 * 10000) / 10000}{" "}
              ETH
            </span>
          </p>
        </div>
        <div className="flex justify-center content-center w-full">
          <div className="text-beige m-1 mt-5">
            <Button
              onClick={() => execute()}
              disabled={!Boolean(account) || !duration || !targetAddress}
            >
              Register from L2
            </Button>
          </div>
          <div className="text-beige m-1 mt-5">
            {!L1Signer && (
              <Button
                onClick={() => {
                  L1connect();
                }}
                disabled={!Boolean(account) || !duration || !targetAddress}
              >
                Connect to L1
              </Button>
            )}
            {L1Signer && (
              <Button
                onClick={() => {
                  L1register();
                }}
                disabled={!Boolean(account) || !duration || !targetAddress}
              >
                Register from L1
              </Button>
            )}
          </div>
        </div>
      </div>
    );

  return <p>This domain is not available you can&rsquo;t register it</p>;
};

export default Register;
