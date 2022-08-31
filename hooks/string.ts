export function isHexString(str: string): boolean {
  if (str === "") return true;
  return /^[0123456789abcdefABCDEF]+$/.test(str.slice(2));
}
