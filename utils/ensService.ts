import { parse } from "tldts";

export function isValidEns(domain: string): boolean {
  if (domain.endsWith(".eth")) return true;
  const parsed = parse(domain);
  return parsed.isIcann ?? false;
}
