import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import styles from "../styles/whitelist.module.css";
import { hexToFelt, scientificToString } from "../utils/felt";
import { starknetIdContract, namingContract } from "../hooks/contracts";
import { useDecodedSeveral } from "../hooks/naming";
import BN from "bn.js";

type WhitelistedDomain = {
  domain: string;
  signature: number[];
  expiry: number;
};

const Whitelist: NextPage = () => {
  const { account } = useAccount();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const [callData, setCallData] = useState<any>([]);
  const [whitelistedDomains, setWhitelistedDomains] = useState<
    WhitelistedDomain[]
  >([]);
  const [domainsBN, setDomainsBN] = useState<BN[][]>([]);
  const decondedDomains = useDecodedSeveral(domainsBN);

  const { execute } = useStarknetExecute({
    calls: callData,
  });

  function register() {
    execute();
  }

  useEffect(() => {
    if (account) {
      fetch(`http://localhost:3000/api/${hexToFelt(account.address)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
          } else {
            setErrorMessage(undefined);
            let domainsBN: BN[][] = [];

            data.forEach((element: WhitelistedDomain) => {
              domainsBN.push([new BN(element.domain)]);
            });

            setWhitelistedDomains(data);
            setDomainsBN(domainsBN);
          }
        });
    }
  }, [account]);

  useEffect(() => {
    if (account && whitelistedDomains.length !== 0) {
      let localCallData: any[] = [];
      whitelistedDomains.forEach((whitelistedDomain) => {
        const newTokenId: number = Math.floor(Math.random() * 1000000000000);

        localCallData.push(
          {
            contractAddress: starknetIdContract,
            entrypoint: "mint",
            calldata: [new BN(newTokenId).toString(10)],
          },
          {
            contractAddress: namingContract,
            entrypoint: "whitelisted_mint",
            calldata: [
              whitelistedDomain.domain,
              new BN(whitelistedDomain.expiry).toString(10),
              new BN(newTokenId).toString(10),
              new BN((account?.address as string).slice(2), 16).toString(10),
              whitelistedDomain.signature[0],
              whitelistedDomain.signature[1],
            ],
          }
        );
      });

      setCallData(localCallData);
    }
  }, [whitelistedDomains, account]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.container}>
        {!account ? (
          <h1 className="title mt-5">Please connect your wallet</h1>
        ) : errorMessage ? (
          <ErrorScreen
            buttonText="back to identities"
            onClick={() => router.push("/")}
            errorMessage="Well tried but ... you're not whitelisted"
          />
        ) : (
          <>
            <h1 className="title mt-5">Your Domain(s) to register</h1>

            <div className={styles.domainContainer}>
              <div className="flex justify-evenly items-center flex-wrap">
                {decondedDomains.map((decodedDomain, index) => (
                  <h4 key={index} className={styles.domainTitle}>
                    {decodedDomain}
                  </h4>
                ))}
              </div>

              <div className="mt-2">
                <Button
                  disabled={decondedDomains.length === 0}
                  onClick={() => register()}
                >
                  Mint all domains
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Whitelist;
