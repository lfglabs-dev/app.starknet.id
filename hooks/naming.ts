import BN from 'bn.js';
import { BigNumberish } from "starknet/utils/number";
import { useStarknetCall } from '@starknet-react/core';
import { useNamingContract } from "./contracts";

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-"
const bigAlphabet = "这来"
const basicAlphabetSize = new BN(basicAlphabet.length)
const bigAlphabetSize = new BN(bigAlphabet.length)

export function useDecoded(encoded: BN) {
    let decoded = ""

    while (!encoded.isZero()) {
        const code = encoded.mod(basicAlphabetSize).toNumber()
        encoded = encoded.div(basicAlphabetSize)
        if (code === basicAlphabet.length - 1) {
            let code2 = encoded.mod(bigAlphabetSize).toNumber()
            decoded += basicAlphabet[code2]
            encoded = encoded.div(bigAlphabetSize)
        } else
            decoded += basicAlphabet[code];
    }
    return decoded;
}

export function useEncoded(decoded: string) {
    let encoded = new BN(0);
    let multiplier = new BN(1);
    const basicSizeMinusOne = new BN(basicAlphabet.length - 1);
    for (let char of decoded) {
        const index = basicAlphabet.indexOf(char);
        const bnIndex = new BN(basicAlphabet.indexOf(char));

        if (index !== -1) {
            // add encoded + multiplier * index
            encoded = encoded.add(multiplier.mul(bnIndex))
            multiplier = multiplier.mul(basicAlphabetSize);
        } else {
            // add encoded + multiplier * (basicAlphabetSize-1)
            encoded = encoded.add(multiplier.mul(basicSizeMinusOne))
            multiplier = multiplier.mul(basicAlphabetSize);
            // add encoded + multiplier * index
            encoded = encoded.add(multiplier.mul(bnIndex))
            multiplier = multiplier.mul(bigAlphabetSize);
        }
    }
    return encoded;
}

export function useDomainFromAddress(address: BigNumberish) {
    const { contract } = useNamingContract();
    const { data, error } = useStarknetCall({ contract, method: "address_to_domain", args: [address] })

    if (!data || (data as any[]).length === 0)
        return { domain: "", error: error ? error : "error" }

    let domain = useDecoded((data as BN[])[0]) + ".stark";

    return { domain, error }
}

export function useAddressFromDomain(domain: string) {
    const { contract } = useNamingContract();
    const encoded = []
    for (const subdomain of domain.split("."))
        encoded.push(useEncoded(subdomain))

    const { data, error } = useStarknetCall({ contract, method: "domain_to_address", args: [encoded] })
    return { address: data, error }
}


export function useIsValid(domain: string) {
    for (const char of domain)
        if (char !== "." && !basicAlphabet.includes(char) && !bigAlphabet.includes(char))
            return false;
    return true;
}