/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import styles from "../../styles/home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import Button from "../../components/UI/button";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import IdentityActions from "../../components/identities/IdentityActions";

export type Identity = {
  name: string;
  description: string;
  image: string;
};

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    if (tokenId) {
      fetch(`https://goerli.indexer2.starknet.id/uri?id=${tokenId}`)
        .then((response) => response.json())
        .then((data) => {
          setIdentity(data);
        });
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
      {!identity ? (
        <ThreeDots
          wrapperClass="flex justify-center"
          height="25"
          width="80"
          radius="9"
          color="#19AA6E"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      ) : (
        <div className={styles2.containerIdentity}>
          <h1 className="sm:text-5xl text-5xl my-5">{identity.name}</h1>
          <div className="mt-3">
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
            domain={
              identity?.name.includes(".stark")
                ? identity.name.replace(".stark", "")
                : undefined
            }
          />
          <div className="mt-5">
            <Button onClick={() => router.push("/")}>
              Back to your identities
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenIdPage;
