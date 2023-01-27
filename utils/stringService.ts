import BN from "bn.js";

export function minifyAddress(address: string): string {
  const firstPart = address.substring(0, 4);
  const secondPart = address.substring(address.length - 3, address.length);

  return (firstPart + "..." + secondPart).toLowerCase();
}

export function hexToDecimal(hex: string): string {
  if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }

  return new BN(hex.slice(2), 16).toString(10);
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

export function getDomainWithoutStark(str: string): string {
  if (str.endsWith(".stark")) {
    return str.slice(0, str.length - 6);
  } else {
    return str;
  }
}

export function isHexString(str: string): boolean {
  if (str === "") return true;
  if (str.toLowerCase().startsWith("0x")) {
    return /^[0123456789abcdefABCDEF]+$/.test(str.slice(2));
  } else {
    return false;
  }
}

export function generateString(length: number, characters: string): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function isSubdomain(domain: string): boolean {
  return Boolean((domain.match(/\./g) || []).length > 1);
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
