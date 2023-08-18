import React from "react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import SearchBar from "../components/UI/searchBar";
import { useExpiryFromDomain } from "../hooks/naming";
import { getDomainWithStark, isStarkRootDomain } from "../utils/stringService";
import IdentityCard from "../components/identities/identityCard";
import IdentityCardSkeleton from "../components/identities/skeletons/identityCardSkeleton";
import { useAccount } from "@starknet-react/core";
import { hexToDecimal } from "../utils/feltService";
import RegisterV2 from "../components/domains/registerV2";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>();
  const { expiry: data, error } = useExpiryFromDomain(domain);
  const [identity, setIdentity] = useState<Identity>();
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(true);

  useEffect(() => {
    if (!identity || !address) return;
    setIsOwner(identity.owner_addr === hexToDecimal(address));
  }, [identity, address]);

  useEffect(() => {
    if (
      router?.query?.domain &&
      isStarkRootDomain(router.query.domain.concat(".stark") as string)
    ) {
      setDomain(router.query.domain as string);
    }
  }, [router]);

  useEffect(() => {
    const currentTimeStamp = new Date().getTime() / 1000;

    if (error || !data) {
      setIsAvailable(false);
    } else {
      setIsAvailable(Number(data?.["expiry"]) < currentTimeStamp);
    }
  }, [data, error, domain]);

  useEffect(() => {
    if (domain && !isAvailable) {
      const refreshData = () =>
        fetch(
          `${
            process.env.NEXT_PUBLIC_SERVER_LINK
          }/domain_to_data?domain=${getDomainWithStark(domain)}`
        )
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(await response.text());
            }
            return response.json();
          })
          .then((data: Identity) => {
            setIdentity(data);
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [domain, isAvailable]);

  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <div className="sm:w-2/3 w-4/5 mt-5 mb-5">
          <SearchBar
            onChangeTypedValue={(typeValue: string) => setDomain(typeValue)}
            showHistory={false}
          />
        </div>
        {isAvailable ? (
          <RegisterV2 domain={domain} />
        ) : identity ? (
          <IdentityCard
            tokenId={identity.starknet_id ?? ""}
            identity={identity}
            isIdentityADomain={true}
            isOwner={isOwner}
          />
        ) : (
          <IdentityCardSkeleton />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
