import { BN } from "bn.js";
import { basicAlphabet } from "./constants";
import { encodeDomain } from "starknetid.js/packages/core/dist/utils";
import { utils } from "starknetid.js";
import { Contract } from "starknet";

export function minifyAddress(address: string | undefined): string {
  if (!address) return "";

  const firstPart = address.substring(0, 4);
  const secondPart = address.substring(address.length - 3, address.length);

  return (firstPart + "..." + secondPart).toLowerCase();
}

export function shortenDomain(
  domain?: string,
  characterToBreak?: number
): string {
  if (!domain) return "";

  if (domain.length > (characterToBreak ?? 20)) {
    const firstPart = domain.substring(0, 4);
    const secondPart = domain.substring(domain.length - 3, domain.length);

    return (firstPart + "..." + secondPart).toLowerCase();
  } else {
    return domain.toLowerCase();
  }
}

export function minifyDomain(
  domain: string,
  characterToBreak?: number
): string {
  if (domain.length > (characterToBreak ?? 18)) {
    const firstPart = domain.substring(0, 4);
    return (firstPart + "...").toLowerCase();
  } else {
    return domain.toLowerCase();
  }
}

export function is1234Domain(domain: string): boolean {
  return /^\d{4}$/.test(domain) && parseInt(domain) < 1234;
}

export function getDomainWithoutStark(str: string | undefined): string {
  if (!str) return "";

  if (str.endsWith(".stark")) {
    return str.slice(0, str.length - 6);
  } else {
    return str;
  }
}

export function getDomainWithStark(str: string | undefined): string {
  if (!str) return "";

  if (!str.endsWith(".stark")) {
    return str.concat(".stark");
  } else {
    return str;
  }
}

export function getDomainWithStarks(str: string[]): string[] {
  return str.map((domain) => getDomainWithStark(domain));
}

export function isHexString(str: string): boolean {
  if (str === "") return true;
  return /^0x[0123456789abcdefABCDEF]+$/.test(str);
}

// this makes sure hex string will be 64 chars
export function formatHexString(txHash: string) {
  // Remove the '0x' prefix if it exists
  if (txHash.startsWith("0x")) {
    txHash = txHash.slice(2);
  }

  // Calculate the number of leading zeros needed
  const totalHashLength = 64; // 64 characters for the hash
  const leadingZerosNeeded = totalHashLength - txHash.length;

  // Add the required leading zeros
  for (let i = 0; i < leadingZerosNeeded; i++) {
    txHash = "0" + txHash;
  }

  // Add the '0x' prefix back
  txHash = "0x" + txHash;

  return txHash.toLowerCase();
}

export function generateString(length: number, characters: string): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function isSubdomain(domain: string | undefined): boolean {
  if (!domain) return false;

  return Boolean((domain.match(/\./g) || []).length > 1);
}

export function isBraavosSubdomain(domain: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.braavos.stark$/.test(domain);
}

export function isXplorerSubdomain(domain: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.xplorer.stark$/.test(domain);
}

export function isSolSubdomain(domain: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.sol.stark$/.test(domain);
}

// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
export function isStarkRootDomain(domain?: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.stark$/.test(domain);
}

export function isStarkDomain(domain?: string): boolean {
  if (!domain) return false;

  return /^(?:[a-z0-9-]{1,48}(?:[a-z0-9-]{1,48}[a-z0-9-])?\.)*[a-z0-9-]{1,48}\.stark$/.test(
    domain
  );
}

export function getDomainKind(domain: string | undefined): DomainKind {
  if (domain && isStarkDomain(domain)) {
    if (isStarkRootDomain(domain)) {
      return "root";
    } else if (isBraavosSubdomain(domain)) {
      return "braavos";
    } else if (isXplorerSubdomain(domain)) {
      return "xplorer";
    } else if (isSolSubdomain(domain)) {
      return "sol";
    } else {
      return "subdomain";
    }
  } else {
    return "none";
  }
}

export function getDomainLength(domain: string | undefined): number {
  if (!domain) return 0;

  return getDomainWithoutStark(domain).length;
}

export function numberToString(element: number | undefined): string {
  if (element === undefined) return "";

  return new BN(element).toString(10);
}
// a function that take a number as a string like 1111 and convert it to 000000001111
export function convertNumberToFixedLengthString(number?: string): string {
  return number ? number.padStart(12, "0") : "000000000000";
}

export function changeTwitterProfilePic(url: string): string {
  return url?.replace("_normal", "");
}

export function cleanUsername(username: string): string {
  return username.startsWith("@") ? username.substring(1) : username;
}

export function isValidEmail(email: string): boolean {
  if (email.includes("..")) return false; // Ensure no consecutive dots
  const emailRegex =
    // eslint-disable-next-line no-control-regex
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return emailRegex.test(email);
}

export function isValidDomain(domain: string | undefined): boolean | string {
  if (!domain) domain = "";

  for (const char of domain) if (!basicAlphabet.includes(char)) return char;
  return true;
}

export function selectedDomainsToArray(
  selectedDomains: Record<string, boolean>
): string[] {
  const domainsString: string[] = Object.entries(selectedDomains)
    .filter(([, isSelected]) => isSelected)
    .map(([domain]) => domain);

  return domainsString;
}

export function selectedDomainsToEncodedArray(
  selectedDomains: Record<string, boolean>
): string[] {
  const domainsString: string[] = Object.entries(selectedDomains)
    .filter(([, isSelected]) => isSelected)
    .map(([domain]) => encodeDomain(domain)[0].toString());

  return domainsString;
}

export function getImgUrl(image: string): string {
  if (image.startsWith("ipfs://")) {
    return image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  } else {
    return image;
  }
}

export async function generateSuggestedDomains(
  domain: string,
  contract: Contract
) {
  const domainParts = domain.split(".");
  const name = domainParts[0];
  const domains = getDomainWithStarks(generateSuggestedNames(name));
  // Shuffle the array
  for (let i = domains.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [domains[i], domains[j]] = [domains[j], domains[i]];
  }
  // Put a domain with the same number + 1 of letters as the original domain at the top if it exists
  // Then same number of letters
  // Then same number of letters - 1
  // Then same number of letters - 2
  // ... 5
  const domainLength = domainParts[0].length;
  for (let i = domainLength + 1; i > domainLength - 5; i--) {
    const index = domains.findIndex(
      (suggestedDomain) => suggestedDomain.length === i + 5
    );
    if (index !== -1) {
      domains.unshift(domains.splice(index, 1)[0]);
    }
  }

  const currentTimeStamp = new Date().getTime() / 1000;
  const availableDomains = [];
  let i = 0;
  while (availableDomains.length < 5 && i < domains.length) {
    const encoded = domains[i]
      ? utils.encodeDomain(domains[i]).map((elem) => elem.toString())
      : [];
    const available =
      Number(await contract?.call("domain_to_expiry", [encoded])) <
      currentTimeStamp;
    if (available) availableDomains.push(domains[i]);
    i++;
  }

  return availableDomains;
}

export function generateSuggestedNames(name: string): string[] {
  const suggestedNames: string[] = [];
  if (name.length > 3) suggestedNames.push(name.slice(0, -1));

  // Check if last char is a vowel or a consonant
  const lastChar = name[name.length - 1];
  const vowels = ["a", "e", "i", "o", "u"];
  const consonants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
  ];
  const interestingConsonants = ["l", "b", "c", "d", "f", "g", "p", "t", "s"];
  const isVowel = vowels.includes(lastChar);
  const isConsonant = consonants.includes(lastChar);

  // Add vowels
  if (isConsonant)
    vowels.forEach((vowel) => {
      suggestedNames.push(name + vowel);
    });

  // Add consonants
  if (isVowel)
    interestingConsonants.forEach((consonant) => {
      suggestedNames.push(name + consonant);
      vowels.forEach((vowel) => {
        suggestedNames.push(name + consonant + vowel);
      });
    });

  if (name.length > 2) {
    return [...suggestedNames, ...generateSuggestedNames(name.slice(0, -1))];
  }
  return suggestedNames;
}

export function getEnsFromStark(
  domain?: string,
  characterToBreak = 25
): string {
  if (!domain) return "";
  return shortenDomain(
    domain.endsWith(".stark") ? domain.replace(".stark", ".snid.eth") : domain,
    characterToBreak
  );
}
