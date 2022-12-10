/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import styles2 from "../styles/search.module.css";
import SearchBar from "../components/UI/searchBar";
import DomainCard from "../components/domains/domainCard";
import DomainMenu from "../components/domains/domainMenu";
import { useExpiryFromDomain } from "../hooks/naming";
import { is1234Domain } from "../utils/stringService";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [domain, setDomain] = useState((router.query.domain as string) ?? "");

  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(
    undefined
  );
  const { expiry: data, error } = useExpiryFromDomain(domain);

  useEffect(() => {
    const currentTimeStamp = new Date().getTime() / 1000;

    if (error || !data || is1234Domain(domain)) {
      setIsAvailable(false);
    } else {
      setIsAvailable(Number(data?.["expiry"]) < currentTimeStamp);
    }
  }, [data, error, domain]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles2.container}>
        <div className="sm:w-2/3 w-4/5 mt-5">
          <SearchBar
            onChangeTypedValue={(typeValue: string) => setDomain(typeValue)}
          />
          {domain && (
            <DomainCard
              isAvailable={isAvailable}
              domain={domain}
              onClick={() => setIsMenuVisible(true)}
            />
          )}
        </div>

        {isMenuVisible ? (
          <DomainMenu isAvailable={isAvailable} domain={domain as string} />
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
