import React from "react";
import { TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import styles from "../../styles/Home.module.css";
import { useEtherContract, usePricingContract } from "../../hooks/contracts";
import {
  Call,
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import { utils } from "starknetid.js";
import BN from "bn.js";
import { isHexString, numberToString } from "../../utils/stringService";
import { gweiToEth, hexToDecimal } from "../../utils/feltService";
import SelectDomain from "./selectDomains";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { Abi } from "starknet";

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
  const [duration, setDuration] = useState<number>(3);
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const [price, setPrice] = useState<string>("0");
  const [balance, setBalance] = useState<string>("0");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { contract } = usePricingContract();
  const { contract: etherContract } = useEtherContract();
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => new BN(element.toString()))[0];
  const { data: priceData, error: priceError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "compute_buy_price",
    args: [encodedDomain, duration * 365],
  });
  const { account, address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "balanceOf",
      args: [address],
    });
  const { writeAsync: execute, data: registerData } = useContractWrite({
    calls: callData,
  });
  const hasMainDomain = !useDisplayName(address ?? "").startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { addTransaction } = useTransactionManager();

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
    if (userBalanceDataError || !userBalanceData) setBalance("0");
    else {
      setBalance(
        userBalanceData?.["balance"].low
          .add(
            userBalanceData?.["balance"].high.mul(new BN(2).pow(new BN(128)))
          )
          .toString(10)
      );
    }
  }, [userBalanceData, userBalanceDataError]);

  useEffect(() => {
    if (balance && price) {
      if (gweiToEth(balance) > gweiToEth(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [balance, price]);

  useEffect(() => {
    if (address) {
      setTargetAddress(address);
    }
  }, [address]);

  // Set mulitcalls
  useEffect(() => {
    if (!isAvailable) return;
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (
      tokenId != 0 &&
      !hasMainDomain &&
      hexToDecimal(address) === hexToDecimal(targetAddress)
    ) {
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
            numberToString(tokenId),
            encodedDomain.toString(10),
            numberToString(duration * 365),
            0,
            hexToDecimal(targetAddress),
          ],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_address_to_domain",
          calldata: [1, encodedDomain.toString(10)],
        },
      ]);
    } else if (
      (tokenId != 0 && hasMainDomain) ||
      (tokenId != 0 &&
        !hasMainDomain &&
        hexToDecimal(address) != hexToDecimal(targetAddress))
    ) {
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
            numberToString(tokenId),
            encodedDomain.toString(10),
            numberToString(duration * 365),
            0,
            hexToDecimal(targetAddress),
          ],
        },
      ]);
    } else if (
      tokenId === 0 &&
      !hasMainDomain &&
      hexToDecimal(address) === hexToDecimal(targetAddress)
    ) {
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
          calldata: [numberToString(newTokenId)],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "buy",
          calldata: [
            numberToString(newTokenId),
            encodedDomain.toString(10),
            numberToString(duration * 365),
            0,
            hexToDecimal(targetAddress),
          ],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_address_to_domain",
          calldata: [1, encodedDomain.toString(10)],
        },
      ]);
    } else if (
      (tokenId === 0 && hasMainDomain) ||
      (tokenId === 0 &&
        !hasMainDomain &&
        hexToDecimal(address) != hexToDecimal(targetAddress))
    ) {
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
          calldata: [numberToString(newTokenId)],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "buy",
          calldata: [
            numberToString(newTokenId),
            encodedDomain.toString(10),
            numberToString(duration * 365),
            0,
            hexToDecimal(targetAddress),
          ],
        },
      ]);
    }
  }, [
    tokenId,
    duration,
    targetAddress,
    isAvailable,
    price,
    domain,
    hasMainDomain,
    address,
  ]);

  useEffect(() => {
    if (!registerData?.transaction_hash) return;
    addTransaction({ hash: registerData?.transaction_hash ?? "" });
  }, [registerData]);

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
  }

  function changeDuration(value: number): void {
    setDuration(value);
  }

  function changeTokenId(value: number): void {
    setTokenId(Number(value));
  }

  if (isAvailable)
    return (
      <div className="w-full">
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
            Price:&nbsp;
            <span className="font-semibold text-brown">
              {gweiToEth(price)}&nbsp;ETH
            </span>
          </p>
        </div>
        <div className="w-full">
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
                !targetAddress ||
                invalidBalance
              }
            >
              {invalidBalance
                ? "You don't have enough eth"
                : "Register from L2"}
            </Button>
          </div>
        </div>
      </div>
    );

  return <p>This domain is not available you can&rsquo;t register it</p>;
};

export default Register;
