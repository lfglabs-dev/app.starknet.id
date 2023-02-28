import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import { Identity } from "../../types/backTypes";
import IdentityWarnings from "../../components/identities/identityWarnings";
import IdentityCard from "../../components/identities/identityCard";
import IdentityMenu from "../../components/identities/identityMenu";

const TokenIdPage: NextPage = () => {
    const router = useRouter();
    const tokenId: string = router.query.tokenId as string;
    const [identity, setIdentity] = useState<Identity>();
    const [isIdentityADomain, setIsIdentityADomain] = useState<
        boolean | undefined
    >();

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
                        <div className="flex flex-col items-center lg:flex-row w-full p-4 justify-center lg:gap-20 h-full">
                            <div className="w-11/12 lg:w-6/12 h-full flex justify-center items-center">
                                <IdentityCard identity={identity} tokenId={tokenId} domain={
                                    isIdentityADomain
                                        ? identity?.domain
                                        : `Starknet ID : ${tokenId}`
                                } />
                            </div>
                            <div className="w-full lg:w-3/12 h-full flex justify-center items-center">
                                <IdentityMenu tokenId={tokenId} isIdentityADomain={isIdentityADomain} identity={identity} />
                            </div>
                        </div>
                        <IdentityWarnings identity={identity} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TokenIdPage;
