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
import { useDisplayName } from "../../hooks/displayName.tsx";

type RegisterProps = {
  expiryDuration: number;
};

const Register: FunctionComponent<RegisterProps> = ({ expiryDuration }) => {
  const [domain, setDomain] = useState<string>("");
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const price = "800000000000000";
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
  const { execute } = useStarknetExecute({
    calls: callData as any,
  });
  const hasMainDomain = !useDisplayName(address ?? "").startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const isDomainValid = useIsValid(domain);

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
          entrypoint: "buy_discounted",
          calldata: [
            numberToString(tokenId),
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
          entrypoint: "buy_discounted",
          calldata: [
            numberToString(tokenId),
            encodedDomain.toString(10),
            numberToString(expiryDuration),
            0,
            hexToDecimal(targetAddress),
            discountID,
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
      ]);
    }
  }, [
    tokenId,
    expiryDuration,
    targetAddress,
    isAvailable,
    price,
    domain,
    hasMainDomain,
    address,
  ]);

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
            : isAvailable === false
            ? "This domain is not available"
            : "Type your domain here"
        }
        placeholder="Domain"
        variant="outlined"
        onChange={(e) => changeDomain(e.target.value)}
        color="secondary"
        required
        error={isDomainValid != true || isAvailable === false}
      />

      <div className="flex justify-center content-center w-full">
        <div className="text-beige m-1 mt-5 mb-5">
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
              Boolean(!domain) ||
              typeof isDomainValid === "string" ||
              !isAvailable
            }
          >
            Register domain
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
