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
import styles from "../../styles/search.module.css";
import SearchBadge from "../UI/searchBadge";
import Link from "next/link";
import SuggestedDomainsSkeleton from "./suggestedDomainsSkeleton";
import { generateSuggestedDomains } from "../../utils/stringService";

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
