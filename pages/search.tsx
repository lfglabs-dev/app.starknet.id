import React from "react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import SearchBar from "../components/UI/searchBar";
import { formatHexString, isStarkRootDomain } from "../utils/stringService";
import IdentityCard from "../components/identities/identityCard";
import IdentityCardSkeleton from "../components/identities/skeletons/identityCardSkeleton";
import { useAccount } from "@starknet-react/core";
import SuggestedDomains from "../components/domains/suggestedDomains";
import { Identity } from "../utils/apiWrappers/identity";
import { hexToDecimal } from "../utils/feltService";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");
  const [identity, setIdentity] = useState<Identity>();
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(true);
  const [ppImageUrl, setPpImageUrl] = useState("");

  useEffect(() => {
    if (!identity || !address) return;
    setIsOwner(identity.ownerAddress === formatHexString(address));
  }, [identity, address]);

  useEffect(() => {
    if (
      router?.query?.domain &&
      isStarkRootDomain(router.query.domain as string)
    ) {
      setDomain(router.query.domain as string);
    }
  }, [router]);

  useEffect(() => {
    if (isStarkRootDomain(domain)) {
      const refreshData = () =>
        fetch(
          `${process.env.NEXT_PUBLIC_SERVER_LINK}/domain_to_data?domain=${domain}`
        )
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(await response.text());
            }
            return response.json();
          })
          .then((data: IdentityData) => {
            setIdentity(new Identity(data));
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [domain]);

  useEffect(() => {
    if (!identity) {
      setPpImageUrl("");
      return;
    }

    const fetchProfilePic = async () => {
      try {
        const imgUrl = await identity.getPfpFromVerifierData();
        setPpImageUrl(imgUrl);
      } catch (error) {
        setPpImageUrl("");
      }
    };

    fetchProfilePic();
  }, [identity]);

  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <div className="sm:w-2/5 w-4/5 mb-5 mt-2">
          <SearchBar
            onChangeTypedValue={(typeValue: string) => setDomain(typeValue)}
            showHistory={false}
          />
        </div>
        {identity ? (
          <IdentityCard
            tokenId={hexToDecimal(identity.id)}
            identity={identity}
            isOwner={isOwner}
            ppImageUrl={ppImageUrl}
            onEdit={() => router.push(`/identities/${identity.id}`)}
          />
        ) : (
          <IdentityCardSkeleton />
        )}
        <SuggestedDomains domain={domain} />
      </div>
    </div>
  );
};

export default SearchPage;
