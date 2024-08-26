import { isStarkRootDomain } from "./stringService";

export function getNonSubscribedDomains(data: NeedSubscription): string[] {
  const result: string[] = [];
  for (const domain in data) {
    if (Object.values(data[domain]).some((value) => value)) {
      result.push(domain);
    }
  }
  return result;
}

export function fullIdsToDomains(fullIds: FullId[]): string[] {
  return fullIds
    .filter((identity: FullId) => isStarkRootDomain(identity.domain))
    .map((identity: FullId) => identity.domain);
}
