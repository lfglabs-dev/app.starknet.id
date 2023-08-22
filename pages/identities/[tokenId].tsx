import React, { useEffect, useState } from "react";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import IdentityWarnings from "../../components/identities/identityWarnings";
import IdentityCard from "../../components/identities/identityCard";
import IdentityActions from "../../components/identities/actions/identityActions";
import { hexToDecimal } from "../../utils/feltService";
import { useAccount } from "@starknet-react/core";
import IdentityPageSkeleton from "../../components/identities/skeletons/identityPageSkeleton";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const [isIdentityADomain, setIsIdentityADomain] = useState<
    boolean | undefined
  >();
  const [hideActions, setHideActions] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  useEffect(() => {
    if (!identity || !address) return;
    setIsOwner(identity.owner_addr === hexToDecimal(address));
  }, [identity, address]);

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
        fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/id_to_data?id=${tokenId}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(await response.text());
            }
            return response.json();
          })
          .then((data: Identity) => {
            setIdentity(data);
            setIsIdentityADomain(true);
          })
          .catch(() => {
            setIsIdentityADomain(false);
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId]);

  return (
    <div className={homeStyles.screen}>
      <div className={homeStyles.wrapperScreen}>
        <div className={styles.containerIdentity}>
          {isIdentityADomain === undefined || !identity ? (
            <IdentityPageSkeleton />
          ) : (
            <>
              <div className={styles.identityBox}>
                <IdentityCard
                  identity={identity}
                  tokenId={tokenId}
                  isIdentityADomain={isIdentityADomain}
                  isOwner={isOwner}
                />
                {!hideActions && (
                  <IdentityActions
                    isOwner={isOwner}
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
