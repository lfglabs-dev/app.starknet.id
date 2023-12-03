import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";
import { Abi, Contract, Provider } from "starknet";
import naming_abi from "../../abi/starknet/naming_abi.json";
import { utils } from "starknetid.js";
import styles from "../../styles/search.module.css";
import SearchBadge from "../UI/searchBadge";
import Link from "next/link";
import SuggestedDomainsSkeleton from "./suggestedDomainsSkeleton";

type SuggestedDomainsProps = {
  domain: string;
};

const SuggestedDomains: FunctionComponent<SuggestedDomainsProps> = ({
  domain,
}) => {
  const { provider } = useContext(StarknetIdJsContext);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(true);

  const contract = useMemo(() => {
    return new Contract(
      naming_abi as Abi,
      process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      provider as Provider
    );
  }, [provider]);
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);

  useEffect(() => {
    if (domain && contract) {
      setLoadingSuggestions(true);
      generateSuggestedDomains(domain, contract).then((suggestedDomains) => {
        setSuggestedDomains(suggestedDomains);
        setLoadingSuggestions(false);
      });
    }
  }, [domain, contract]);

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
                <SearchBadge error={false} message={"available"} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedDomains;

const generateSuggestedDomains = async (domain: string, contract: Contract) => {
  const domainParts = domain.split(".");
  const name = domainParts[0];
  const domains = generateSuggestedNames(name).map(
    (suggestedName) => `${suggestedName}.stark`
  );

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
      Number(
        (await contract?.call("domain_to_expiry", [encoded]))?.["expiry"]
      ) < currentTimeStamp;
    if (available) availableDomains.push(domains[i]);
    i++;
  }

  return availableDomains;
};

const generateSuggestedNames: (name: string) => string[] = (name) => {
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
};
