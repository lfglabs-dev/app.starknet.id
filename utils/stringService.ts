export function minifyAddressOrDomain(
  address: string,
  characterToBreak?: number
): string {
  const characterToBreakAlternative = window.innerWidth < 640 ? 9 : 18;

  if (address.length > (characterToBreak ?? characterToBreakAlternative)) {
    const firstPart = address.charAt(0) + address.charAt(1) + address.charAt(2);
    const secondPart =
      address.charAt(address.length - 3) +
      address.charAt(address.length - 2) +
      address.charAt(address.length - 1);
    return (firstPart + "..." + secondPart).toLowerCase();
  } else {
    return address.toLowerCase();
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
  return /^[0123456789abcdefABCDEF]+$/.test(str.slice(2));
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
export function isStarkDomain(domain: string): boolean {
  return /^([a-z0-9-]){1,48}\.stark$/.test(domain);
}
