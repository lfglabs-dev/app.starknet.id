import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import Button from "../../components/UI/button";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import IdentityActions from "../../components/identities/identitiesActions";
import Link from "next/link";
import { getDomainWithoutStark, isSubdomain } from "../../utils/stringService";
import { Identity } from "../../types/backTypes";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const [isIdentityADomain, setIsIdentityADomain] = useState<
    boolean | undefined
  >();
  const currentTimeStamp = new Date().getTime() / 1000;

  useEffect(() => {
    if (tokenId) {
      const refreshData = () =>
        fetch(`/api/indexer/id_to_data?id=${tokenId}`)
          .then((response) => response.json())
          .then((data: Identity) => {
            if (data.error) {
              setIsIdentityADomain(false);
              return;
            }
            setIdentity(data);
            setIsIdentityADomain(true);
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles2.containerIdentity}>
        {isIdentityADomain === undefined ? (
          <div className="h-full flex items-center justify-center">
            <ThreeDots
              height="25"
              width="80"
              radius="9"
              color="#19AA6E"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          <>
            <h1 className="sm:text-5xl text-4xl my-5 break-all mx-3">
              {isIdentityADomain
                ? identity?.domain
                : `Starknet ID : ${tokenId}`}
            </h1>
            <div>
              <img
                src={`https://www.starknet.id/api/identicons/${tokenId}`}
                height={200}
                width={200}
                alt="identicon"
              />
            </div>

            <IdentityActions
              identity={identity}
              tokenId={tokenId}
              isIdentityADomain={isIdentityADomain}
            />
            {Number(identity?.domain_expiry) < currentTimeStamp &&
            !isSubdomain(identity?.domain ?? "") ? (
              <strong className="mt-2 text-red-600 text-center">
                (This domain has expired you can buy it on the&nbsp;
                <span className="underline">
                  <Link
                    href={
                      "/search?domain=" +
                      getDomainWithoutStark(identity?.domain ?? "")
                    }
                  >
                    domain page
                  </Link>
                </span>
                )
              </strong>
            ) : null}
            <div className="mt-5">
              <Button onClick={() => router.push("/")}>
                Back to your identities
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TokenIdPage;
