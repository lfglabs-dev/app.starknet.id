import { BN } from "bn.js";

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

export function isHexString(str: string): boolean {
  if (str === "") return true;
  return /^0x[0123456789abcdefABCDEF]+$/.test(str);
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
// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
export function isStarkRootDomain(domain: string): boolean {
  return /^([a-z0-9-]){1,48}\.stark$/.test(domain);
}

export function isStarkDomain(domain: string) {
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
    } else {
      return "subdomain";
    }
  } else {
    return "none";
  }
}

export function numberToString(element: number | undefined): string {
  if (element === undefined) return "";

  return new BN(element).toString(10);
}
// a function that take a number as a string like 1111 and convert it to 000000001111
export function convertNumberToFixedLengthString(number: string): string {
  return number.padStart(12, "0");
}
