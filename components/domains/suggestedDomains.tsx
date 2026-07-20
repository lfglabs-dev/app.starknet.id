import React, { type FunctionComponent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/search.module.css";
import SearchBadge from "../UI/searchBadge";
import SuggestedDomainsSkeleton from "./suggestedDomainsSkeleton";
import { readDomainExpiry } from "@/lib/chain/contracts";
import { normalizeDomain } from "@/lib/chain/domain";

type SuggestedDomainsProps = {
  domain: string;
};

function generateSuggestedNames(name: string): string[] {
  const suggestedNames: string[] = [];
  if (name.length > 3) suggestedNames.push(name.slice(0, -1));
  const lastCharacter = name[name.length - 1];
  const vowels = ["a", "e", "i", "o", "u"];
  const consonants = [
    "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p",
    "q", "r", "s", "t", "v", "w", "x", "y",
  ];
  const interestingConsonants = ["l", "b", "c", "d", "f", "g", "p", "t", "s"];
  if (consonants.includes(lastCharacter)) {
    vowels.forEach((vowel) => suggestedNames.push(name + vowel));
  }
  if (vowels.includes(lastCharacter)) {
    interestingConsonants.forEach((consonant) => {
      suggestedNames.push(name + consonant);
      vowels.forEach((vowel) => suggestedNames.push(name + consonant + vowel));
    });
  }
  if (name.length > 2) {
    return [...suggestedNames, ...generateSuggestedNames(name.slice(0, -1))];
  }
  return suggestedNames;
}

async function generateSuggestedDomains(domain: string): Promise<string[]> {
  const name = domain.split(".")[0];
  const domains = generateSuggestedNames(name).map((value) =>
    normalizeDomain(value)
  );
  for (let index = domains.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [domains[index], domains[swapIndex]] = [domains[swapIndex], domains[index]];
  }
  const domainLength = name.length;
  for (let length = domainLength + 1; length > domainLength - 5; length -= 1) {
    const index = domains.findIndex(
      (suggestedDomain) => suggestedDomain.length === length + 5
    );
    if (index !== -1) domains.unshift(domains.splice(index, 1)[0]);
  }
  const availableDomains: string[] = [];
  let index = 0;
  while (availableDomains.length < 5 && index < domains.length) {
    const expiry = await readDomainExpiry(domains[index]);
    if (Number(expiry) < Date.now() / 1000) {
      availableDomains.push(domains[index]);
    }
    index += 1;
  }
  return availableDomains;
}

const SuggestedDomains: FunctionComponent<SuggestedDomainsProps> = ({
  domain,
}) => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);

  useEffect(() => {
    if (!domain) return;
    let cancelled = false;
    setLoadingSuggestions(true);
    void generateSuggestedDomains(domain)
      .then((suggestions) => {
        if (!cancelled) setSuggestedDomains(suggestions);
      })
      .catch(() => {
        if (!cancelled) setSuggestedDomains([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSuggestions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  return (
    <div className={styles.suggestionCategory}>
      <h2 className={styles.subtitle}>OUR SUGGESTIONS</h2>
      {loadingSuggestions ? (
        <SuggestedDomainsSkeleton />
      ) : (
        <div className={styles.suggestionTable}>
          {suggestedDomains.map((suggestedDomain, index) => (
            <Link
              href={`/register/${suggestedDomain}`}
              key={index}
              className={styles.suggestedDomainLink}
            >
              <div className={styles.suggestedDomainContainer}>
                <p className="mr-auto">{suggestedDomain}</p>
                <SearchBadge error={false} message={"Available"} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedDomains;
