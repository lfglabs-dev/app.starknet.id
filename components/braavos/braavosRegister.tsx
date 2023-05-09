import React from "react";
import { TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount } from "@starknet-react/core";
import { useStarknetExecute } from "@starknet-react/core";
import {
  useEncoded,
  useExpiryFromDomain,
  useIsValid,
} from "../../hooks/naming";
import { numberToString } from "../../utils/stringService";
import { hexToDecimal } from "../../utils/feltService";
import { Call } from "starknet";

type BraavosRegisterProps = {
  expiryDuration: number;
  showTwitterCta: () => void;
};

const BraavosRegister: FunctionComponent<BraavosRegisterProps> = ({
  expiryDuration,
  showTwitterCta,
}) => {
  const [domain, setDomain] = useState<string>("");
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const encodedDomain = useEncoded(domain ?? "");
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const { expiry: data, error } = useExpiryFromDomain(domain);
  const discountID = "27092002";

  useEffect(() => {
    if (!domain) return;

    const currentTimeStamp = new Date().getTime() / 1000;

    if (error || !data) {
      setIsAvailable(false);
    } else {
      setIsAvailable(Number(data?.["expiry"]) < currentTimeStamp);
    }
  }, [data, error, domain]);

  const { account, address } = useAccount();
  const { execute, data: mintDataLevel2 } = useStarknetExecute({
    calls: callData as any,
  });
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const isDomainValid = useIsValid(domain);

  useEffect(() => {
    if (address) {
      setTargetAddress(address);
    }
  }, [address]);

  // Set mulitcall
  useEffect(() => {
    if (!isAvailable) return;
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const price = "800000000000000";

    setCallData([
      {
        contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
        entrypoint: "approve",
        calldata: [process.env.NEXT_PUBLIC_NAMING_CONTRACT as string, price, 0],
      },
      {
        contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
        entrypoint: "mint",
        calldata: [numberToString(newTokenId)],
      },
      {
        contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
        entrypoint: "buy_discounted",
        calldata: [
          numberToString(newTokenId),
          encodedDomain.toString(10),
          numberToString(expiryDuration),
          0,
          hexToDecimal(targetAddress),
          discountID,
        ],
      },
      {
        contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
        entrypoint: "set_address_to_domain",
        calldata: [1, encodedDomain.toString(10)],
      },
      {
        contractAddress: process.env
          .NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
        entrypoint: "mint",
        calldata: [1],
      },
    ]);
  }, [tokenId, expiryDuration, targetAddress, isAvailable, domain, address]);

  function changeDomain(value: string): void {
    setDomain(value);
  }

  return (
    <div className="w-full">
      <TextField
        fullWidth
        id="outlined-basic"
        label={
          isDomainValid != true
            ? `"${isDomainValid}" is not a valid character`
            : domain && domain?.length < 5
            ? "This Discount available for 5 or more characters"
            : isAvailable === false
            ? "This domain is not available"
            : "Type your domain here"
        }
        placeholder="Domain"
        variant="outlined"
        onChange={(e) => changeDomain(e.target.value)}
        color="secondary"
        required
        error={
          isDomainValid != true ||
          isAvailable === false ||
          Boolean(domain && domain?.length < 5)
        }
      />

      <div className="flex justify-center content-center w-full">
        <div className="text-beige m-1 mt-5 mb-5">
          <Button
            onClick={() =>
              execute().then(() => {
                setDomainsMinting((prev) =>
                  new Map(prev).set(encodedDomain.toString(), true)
                );
                showTwitterCta();
              })
            }
            disabled={
              (domainsMinting.get(encodedDomain.toString()) as boolean) ||
              !account ||
              typeof isDomainValid === "string" ||
              !isAvailable ||
              Boolean(domain?.length < 5)
            }
          >
            Register domain
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BraavosRegister;
