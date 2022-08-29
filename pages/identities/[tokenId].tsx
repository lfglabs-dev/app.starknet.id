/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import styles from "../../styles/home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useStarknet } from "@starknet-react/core";
import { useRouter } from "next/router";
import Button from "../../components/UI/button";
import ClickableIcon from "../../components/UI/icons/clickableIcon";
import { NextPage } from "next";
import Image from "next/image";
import { ThreeDots } from "react-loader-spinner";

type Identity = {
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
      fetch(`https://indexer.starknet.id/uri?id=${tokenId}`)
        .then((response) => response.json())
        .then((data) => setIdentity(data));
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
        <div className={styles.container}>
          <ThreeDots
            wrapperClass="flex justify-center"
            height="25"
            width="80"
            radius="9"
            color="#19AA6E"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      ) : (
        <div className={styles2.containerIdentity}>
          <h1 className="sm:text-5xl text-5xl my-5">{identity.name}</h1>
          <div className="mt-3">
            <Image
              src={identity.image}
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
                  window.location.replace(
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
                  window.location.replace(
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
                  window.location.replace(
                    "https://github.com/login/oauth/authorize?client_id=bd72ec641d75c2608121"
                  );
                }}
              />
            </div>
          </div>
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
