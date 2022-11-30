export function isHexString(str: string): boolean {
  if (str === "") return true;
  return /^[0123456789abcdefABCDEF]+$/.test(str.slice(2));
}

const characters = "abcdefghijklmnopqrstuvwxyz0123456789-这来";

export function generateString(length: number): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
