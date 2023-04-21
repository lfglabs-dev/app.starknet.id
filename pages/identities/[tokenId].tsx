import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import { Identity } from "../../types/backTypes";
import IdentityWarnings from "../../components/identities/identityWarnings";
import IdentityCard from "../../components/identities/identityCard";
import IdentityActions from "../../components/identities/identityActions";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const [isIdentityADomain, setIsIdentityADomain] = useState<
    boolean | undefined
  >();
  const [hideActions, setHideActions] = useState(false);

  const hideActionsHandler = (state: boolean) => {
    if (state == true) {
      setHideActions(true);
    } else {
      setHideActions(false);
    }
  };

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
      <div className={styles.wrapperScreen}>
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
              <div className={styles2.identityBox}>
                <IdentityCard
                  identity={identity}
                  tokenId={tokenId}
                  domain={
                    isIdentityADomain ? identity?.domain : `SID: ${tokenId}`
                  }
                />
                {!hideActions && (
                  <IdentityActions
                    tokenId={tokenId}
                    isIdentityADomain={isIdentityADomain}
                    identity={identity}
                    hideActionsHandler={hideActionsHandler}
                  />
                )}
              </div>
              <IdentityWarnings
                isIdentityADomain={isIdentityADomain}
                identity={identity}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenIdPage;
