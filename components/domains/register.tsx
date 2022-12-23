import React from "react";
import { TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import styles from "../../styles/Home.module.css";
import { usePricingContract } from "../../hooks/contracts";
import { useAccount, useStarknetCall } from "@starknet-react/core";
import { useStarknetExecute } from "@starknet-react/core";
import { useEncoded } from "../../hooks/naming";
import BN from "bn.js";
import { isHexString } from "../../utils/stringService";
import { ethers } from "ethers";
import L1buying_abi from "../../abi/L1/L1Buying_abi.json";
import SelectDomain from "./selectDomains";
import { Call } from "starknet/types";
import { getYearlyPriceFromDomain } from "../../utils/priceService";

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
  const [callData, setCallData] = useState<Call[]>([]);
  const [price, setPrice] = useState<string>("0");
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState<number>(
    Math.round(getYearlyPriceFromDomain(domain) * 1000) / 1000
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
    calls: callData as any,
  });

  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );

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
      Math.round(duration * getYearlyPriceFromDomain(domain) * 1000) / 1000
    );
  }, [duration, domain]);

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
          contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
          entrypoint: "approve",
          calldata: [
            process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
            price,
            0,
          ],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
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
          contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
          entrypoint: "approve",
          calldata: [
            process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
            price,
            0,
          ],
        },
        {
          contractAddress: process.env
            .NEXT_PUBLIC_STARKNETID_CONTRACT as string,
          entrypoint: "mint",
          calldata: [new BN(newTokenId).toString(10)],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
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

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
  }

  function changeDuration(value: number): void {
    setDuration(value);
  }

  function changeTokenId(value: number): void {
    setTokenId(Number(value));
  }

  // register from L1
  const [L1Signer, setL1Signer] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >();

  async function L1connect() {
    let provider;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
      provider = new ethers.providers.Web3Provider((window as any).ethereum);
    } catch (switchError) {
      if ((switchError as any).code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x1",
              rpcUrls: ["https://mainnet.infura.io/v3/"],
              chainName: "Ethereum",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://etherscan.io/"],
            },
          ],
        });
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
      }
    }

    await provider?.send("eth_requestAccounts", []);
    const signer = provider?.getSigner();
    setL1Signer(signer);
  }

  async function L1register() {
    const L1buyingContract_rw = new ethers.Contract(
      process.env.NEXT_PUBLIC_L1BUYING_CONTRACT as string,
      L1buying_abi,
      L1Signer
    );

    await L1buyingContract_rw.purchase(
      encodedDomain.toString(),
      tokenId,
      duration * 365,
      0,
      targetAddress,
      {
        value: price,
        gasLimit: 100000,
      }
    );
    setDomainsMinting((prev) =>
      new Map(prev).set(encodedDomain.toString(), true)
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
              onChange={(e) => changeAddress(e.target.value)}
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
              onChange={(e) => changeDuration(Number(e.target.value))}
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
              onClick={() =>
                execute().then(() =>
                  setDomainsMinting((prev) =>
                    new Map(prev).set(encodedDomain.toString(), true)
                  )
                )
              }
              disabled={
                (domainsMinting.get(encodedDomain.toString()) as boolean) ||
                !account ||
                !duration ||
                duration < 1 ||
                !targetAddress
              }
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
                disabled={
                  (domainsMinting.get(encodedDomain.toString()) as boolean) ||
                  !account ||
                  !duration ||
                  duration < 1 ||
                  !targetAddress
                }
              >
                Connect to L1
              </Button>
            )}
            {L1Signer && (
              <Button
                onClick={() => {
                  L1register();
                }}
                disabled={
                  (domainsMinting.get(encodedDomain.toString()) as boolean) ||
                  !account ||
                  !duration ||
                  duration < 1 ||
                  !targetAddress ||
                  !tokenId
                }
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
