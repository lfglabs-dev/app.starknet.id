/* eslint-disable react-hooks/rules-of-hooks */
import BN from "bn.js";
import { BigNumberish } from "starknet/utils/number";
import { useStarknetCall } from "@starknet-react/core";
import { useNamingContract } from "./contracts";
import { useState, useEffect } from "react";
const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = new BN(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = new BN(basicAlphabet.length);
const bigAlphabetSize = new BN(bigAlphabet.length);
const bigAlphabetSizePlusOne = new BN(bigAlphabet.length + 1);

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k++;
  }
  return [str, k];
}

export function useDecoded(encoded: BN[]): string {
  let decoded = "";
  for (let subdomain of encoded) {
    while (!subdomain.isZero()) {
      const code = subdomain.mod(basicSizePlusOne).toNumber();
      subdomain = subdomain.div(basicSizePlusOne);
      if (code === basicAlphabet.length) {
        const nextSubdomain = subdomain.div(bigAlphabetSizePlusOne);
        if (nextSubdomain.isZero()) {
          let code2 = subdomain.mod(bigAlphabetSizePlusOne).toNumber();
          subdomain = nextSubdomain;
          if (code2 === 0)
            decoded += basicAlphabet[0];
          else
            decoded += bigAlphabet[code2 - 1];
        } else {
          let code2 = subdomain.mod(bigAlphabetSize).toNumber();
          decoded += bigAlphabet[code2];
          subdomain = subdomain.div(bigAlphabetSize)
        }
      } else decoded += basicAlphabet[code];
    }

    let [str, k] = extractStars(decoded);
    if (k)
      decoded = str + (k % 2 == 0 ? bigAlphabet[bigAlphabet.length - 1].repeat(k / 2 - 1) + bigAlphabet[0] + basicAlphabet[1] : bigAlphabet[bigAlphabet.length - 1].repeat((k - 1) / 2 + 1));
    decoded += ".";
  }
  return decoded + "stark";
}


export function useEncoded(decoded: string): BN {
  let encoded = new BN(0);
  let multiplier = new BN(1);

  if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
    let [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
    decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
  } else {
    let [str, k] = extractStars(decoded);
    if (k)
      decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
  }

  for (let i = 0; i < decoded.length; i++) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = new BN(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded = encoded.add(multiplier.mul(basicAlphabetSize));
        multiplier = multiplier.mul(basicSizePlusOne);
        // add 0
        multiplier = multiplier.mul(basicSizePlusOne);
      } else {
        encoded = encoded.add(multiplier.mul(bnIndex));
        multiplier = multiplier.mul(basicSizePlusOne);
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded = encoded.add(multiplier.mul(basicAlphabetSize));
      multiplier = multiplier.mul(basicSizePlusOne);
      // add encoded + multiplier * index
      let newid = (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded = encoded.add(multiplier.mul(new BN(newid)));
      multiplier = multiplier.mul(bigAlphabetSize);
    }
  }

  return encoded;
}

export function useEncodedSeveral(domains: string[]): string[] {
  let encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(useEncoded(domain).toString(10));
  });
  return encodedArray;
}

export function useDecodedSeveral(domains: BN[][]): string[] {
  let encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(useDecoded(domain));
  });
  return encodedArray;
}

type DomainData = {
  domain?: string;
  error?: string;
};

export function useDomainFromAddress(address: BigNumberish): DomainData {
  const { contract } = useNamingContract();
  const { data, error } = useStarknetCall({
    contract,
    method: "address_to_domain",
    args: [address],
  });

  if (!data || data?.["domain_len"] === 0) {
    return { domain: "", error: error ? error : "error" };
  } else {
    let domain = useDecoded(data[0] as any);
    return { domain: domain as any, error };
  }
}

type AddrToDomain = {
  domain: string;
  domain_expiry: Number;
};

export function useUpdatedDomainFromAddress(
  address: string | undefined
): string {
  const [domain, setDomain] = useState("");
  const [decimalAddr, setDecimalAddr] = useState("0");

  useEffect(() => {
    if (!address) return;
    setDecimalAddr(new BN((address ?? "").slice(2), 16).toString(10));
    updateDomain(decimalAddr);
  }, [decimalAddr, address]);

  const updateDomain = (decimalAddr: String) =>
    fetch(
      `https://${process.env.NEXT_PUBLIC_INDEXER_LINK}/addr_to_domain?addr=${decimalAddr}`
    )
      .then((response) => response.json())
      .then((data: AddrToDomain) => {
        setDomain(data.domain);
      });

  useEffect(() => {
    const timer = setInterval(() => updateDomain(decimalAddr), 8e3);
    return () => clearInterval(timer);
  }, [decimalAddr]);

  return domain;
}

type AddressData = {
  address?: any;
  error?: string;
};

export function useAddressFromDomain(domain: string): AddressData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_address",
    args: [encoded],
  });

  return { address: data as any, error };
}

export function useIsValid(domain: string): boolean | string {
  for (const char of domain)
    if (!basicAlphabet.includes(char) && !bigAlphabet.includes(char))
      return char;
  return true;
}

type TokenIdData = {
  tokenId?: any;
  error?: string;
};

export function useTokenIdFromDomain(domain: string): TokenIdData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_token_id",
    args: [encoded],
  });

  return { tokenId: data as any, error };
}

type ExpiryData = {
  expiry?: any;
  error?: string;
};

export function useExpiryFromDomain(domain: string): ExpiryData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_expiry",
    args: [encoded],
  });

  return { expiry: data as any, error };
}
