export function removeStarkFromString(domain: string): string {
  return domain.slice(0, domain.length - 6);
}

export function isStarkDomain(domain: string): boolean {
  return domain.includes(".stark");
}

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
