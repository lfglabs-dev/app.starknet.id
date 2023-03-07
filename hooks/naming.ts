import BN from "bn.js";
import { useStarknetCall } from "@starknet-react/core";
import { useNamingContract } from "./contracts";
import { utils } from "starknetid.js";

export const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
export const bigAlphabet = "这来";
export const totalAlphabet = basicAlphabet + bigAlphabet;

export function useDecoded(encoded: bigint[]): string {
  const decoded = utils.decodeDomain(encoded);
  return decoded;
}

export function useEncoded(decoded: string): bigint {
  return utils.encode(decoded);
}

export function useEncodedSeveral(domains: string[]): string[] {
  const encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(useEncoded(domain).toString(10));
  });
  return encodedArray;
}

export function useDecodedSeveral(domains: bigint[][]): string[] {
  const encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(useDecoded(domain));
  });
  return encodedArray;
}

export function useDomainFromAddress(address: string | BN | undefined): string {
  const { contract } = useNamingContract();
  const { data, error } = useStarknetCall({
    contract,
    method: "address_to_domain",
    args: [address],
  });

  if (!data || (data as BN[][])["domain_len"] === 0 || error) {
    return error ? error : "";
  } else {
    const domain = useDecoded(data[0]);

    return domain;
  }
}

type AddressData = {
  address?: BN[][];
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

  return { address: data as BN[][], error };
}

export function useIsValid(domain: string | undefined): boolean | string {
  if (!domain) domain = "";

  for (const char of domain) if (!basicAlphabet.includes(char)) return char;
  return true;
}

type TokenIdData = {
  tokenId?: BN[][];
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

  return { tokenId: data, error };
}

type ExpiryData = {
  expiry?: BN[][];
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

  return { expiry: data as BN[][], error };
}
