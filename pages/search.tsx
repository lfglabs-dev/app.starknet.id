import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import SearchBar from "../components/UI/searchBar";
import IdentityCard from "../components/identities/identityCard";
import IdentityCardSkeleton from "../components/identities/skeletons/identityCardSkeleton";
import SuggestedDomains from "../components/domains/suggestedDomains";
import type { IdentityView } from "@/lib/ui/identity";
import {
  readDomainExpiry,
  readDomainId,
  readOwnerOf,
  readUserData,
  STARKNET_FIELD,
} from "@/lib/chain/contracts";
import { isRootDomain, normalizeDomain } from "@/lib/chain/domain";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [identity, setIdentity] = useState<IdentityView>();

  useEffect(() => {
    if (typeof router.query.domain !== "string") return;
    try {
      const normalized = normalizeDomain(router.query.domain);
      if (isRootDomain(normalized)) setDomain(normalized);
    } catch {
      setDomain("");
    }
  }, [router.query.domain]);

  useEffect(() => {
    if (!isRootDomain(domain)) return;
    let cancelled = false;
    async function refreshData(): Promise<void> {
      try {
        const [tokenId, expiry] = await Promise.all([
          readDomainId(domain),
          readDomainExpiry(domain),
        ]);
        if (tokenId === "0") return;
        const [owner, target] = await Promise.all([
          readOwnerOf(tokenId),
          readUserData(tokenId, STARKNET_FIELD),
        ]);
        if (!cancelled && owner) {
          setIdentity({
            tokenId,
            owner,
            isMain: false,
            targetAddress: BigInt(target) === 0n ? owner : target,
            domain,
            domainExpiry: Number(expiry),
          });
        }
      } catch {
        if (!cancelled) setIdentity(undefined);
      }
    }
    void refreshData();
    const timer = window.setInterval(() => void refreshData(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [domain]);

  return (
    <div className={homeStyles.screen}>
      <div
        style={{ justifyContent: "start", padding: "1rem" }}
        className={styles.container}
      >
        <div className="sm:w-3/5 md:w-2/5 w-4/5 mb-5 mt-2 ">
          <SearchBar
            onChangeTypedValue={(typedValue: string) =>
              setDomain(normalizeDomain(typedValue))
            }
            showHistory={false}
          />
        </div>
        {identity ? (
          <IdentityCard tokenId={identity.tokenId} identity={identity} />
        ) : (
          <IdentityCardSkeleton />
        )}
        <SuggestedDomains domain={domain} />
      </div>
    </div>
  );
};

export default SearchPage;
