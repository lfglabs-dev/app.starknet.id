/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import Button from "../../components/UI/button";
import ClickableIcon from "../../components/UI/icons/clickableIcon";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import { useStarknet, useStarknetInvoke } from "@starknet-react/core";
import { useNamingContract } from "../../hooks/contracts";
import { useDomainFromAddress, useEncoded } from "../../hooks/naming";
import { BN } from "bn.js";

type Identity = {
  name: string;
  description: string;
  image: string;
};

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const encodedDomain = useEncoded(
    (identity?.name.replace(".stark", "") as string) ?? ""
  );
  const { contract } = useNamingContract();
  const { invoke } = useStarknetInvoke({
    contract: contract,
    method: "set_address_to_domain",
  });
  const { account } = useStarknet();
  const { domain } = useDomainFromAddress(
    new BN((account ?? "").slice(2), 16).toString(10)
  );

  useEffect(() => {
    if (tokenId) {
      fetch(`https://goerli.indexer.starknet.id/uri?id=${tokenId}`)
        .then((response) => response.json())
        .then((data) => {
          setIdentity(data);
        });
    }
  }, [tokenId]);

  function setAddressToDomain(): void {
    invoke({
      args: [[encodedDomain.toString(10)]],
    });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img alt="leaf" src="/leaves/leaf_1.png" />
      </div>

      <div className={styles2.containerIdentity}>
        <h1 className="sm:text-5xl text-5xl my-5">Starknet ID : {tokenId}</h1>
        <div className="mt-3">
          <img
            src={`https://www.starknet.id/api/identicons/${tokenId}`}
            height={200}
            width={200}
            alt="identicon"
          />
        </div>

        <div className="flex">
          <div className="m-1">
            <ClickableIcon
              icon="twitter"
              onClick={() => {
                sessionStorage.setItem("tokenId", tokenId);
                router.push(
                  "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=Rkp6QlJxQzUzbTZtRVljY2paS0k6MTpjaQ&redirect_uri=https://starknet.id/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain"
                );
              }}
            />
          </div>
          <div className="m-1">
            <ClickableIcon
              icon="discord"
              onClick={() => {
                sessionStorage.setItem("tokenId", tokenId);
                router.push(
                  "https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=https%3A%2F%2Fstarknet.id%2Fdiscord&response_type=code&scope=identify"
                );
              }}
            />
            <div className="flex justify-center items-center"></div>
          </div>
          <div className="m-1">
            <ClickableIcon
              icon="github"
              onClick={() => {
                sessionStorage.setItem("tokenId", tokenId);
                router.push(
                  "https://github.com/login/oauth/authorize?client_id=bd72ec641d75c2608121"
                );
              }}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-col">
          {identity &&
          identity.name.includes(".stark") &&
          domain != identity.name ? (
            <Button onClick={() => setAddressToDomain()}>
              Set as main domain
            </Button>
          ) : null}
          <Button onClick={() => router.push("/")}>
            Back to your identities
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenIdPage;
