/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";
import styles2 from "../styles/search.module.css";
import SearchBar from "../components/UI/searchBar";
import DomainCard from "../components/domains/domainCard";
import DomainMenu from "../components/domains/domainMenu";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const value = router.query.value;
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles2.container}>
        <div className="sm:w-2/3 w-4/5 min-w-fit mt-5">
          <SearchBar />
          <DomainCard
            isAvailable
            value={value as string}
            onClick={() => setIsMenuVisible(true)}
          />
        </div>

        {isMenuVisible ? (
          <DomainMenu isAvailable domain={value as string} />
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
