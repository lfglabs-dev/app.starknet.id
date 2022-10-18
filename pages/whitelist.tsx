import {
  useAccount,
  useStarknetCall,
  useStarknetExecute,
} from "@starknet-react/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SelectDomain from "../components/domains/selectDomains";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import styles from "../styles/whitelist.module.css";
import { hexToFelt } from "../utils/felt";
import {
  starknetIdContract,
  etherContract,
  namingContract,
  usePricingContract,
} from "../hooks/contracts";
import { useEncoded } from "../hooks/naming";
import BN from "bn.js";

type WhitelistedDomain = {
  domain: string;
  signature: number[];
  expiry: number;
};

const Whitelist: NextPage = () => {
  const { account } = useAccount();
  const [whitelistedDomains, setWhitelistedDomains] =
    useState<WhitelistedDomain[]>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<any>([]);
  const [domain, setDomain] = useState<string>("");
  const [price, setPrice] = useState<string>("0");

  const { contract } = usePricingContract();
  const encodedDomain = useEncoded(domain);
  const { data: priceData, error: priceError } = useStarknetCall({
    contract: contract,
    method: "compute_buy_price",
    args: [encodedDomain, 365],
  });

  const { execute } = useStarknetExecute({
    calls: callData,
  });

  function changeTokenId(e: any): void {
    setTokenId(Number(e.target.value));
  }

  function register(domain: string) {
    setDomain(domain);
    execute();
  }

  useEffect(() => {
    if (priceError || !priceData) setPrice("0");
    else {
      setPrice(
        priceData?.["price"].low
          .add(priceData?.["price"].high.mul(new BN(2).pow(new BN(128))))
          .toString(10)
      );
    }
  }, [priceData, priceError]);

  useEffect(() => {
    if (account) {
      fetch(`http://localhost:3000/api/${hexToFelt(account.address)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
          } else {
            setErrorMessage(undefined);
            setWhitelistedDomains(data);
          }
        });
    }
  }, [account]);

  useEffect(() => {
    if (tokenId != 0 && account) {
      setCallData([
        {
          contractAddress: etherContract,
          entrypoint: "approve",
          calldata: [namingContract, price, 0],
        },
        {
          contractAddress: namingContract,
          entrypoint: "buy",
          calldata: [
            new BN(tokenId).toString(10),
            new BN(encodedDomain).toString(10),
            new BN(365).toString(10),
            0,
            new BN(account.address.slice(2), 16).toString(10),
          ],
        },
      ]);
    }
    if (account) {
      const newTokenId: number = Math.floor(Math.random() * 1000000000000);

      setCallData([
        {
          contractAddress: etherContract,
          entrypoint: "approve",
          calldata: [namingContract, price, 0],
        },
        {
          contractAddress: starknetIdContract,
          entrypoint: "mint",
          calldata: [new BN(newTokenId).toString(10)],
        },
        {
          contractAddress: namingContract,
          entrypoint: "buy",
          calldata: [
            new BN(newTokenId).toString(10),
            new BN(encodedDomain).toString(10),
            new BN(365).toString(10),
            0,
            new BN((account?.address as string).slice(2), 16).toString(10),
          ],
        },
      ]);
    }
  }, [tokenId, price, encodedDomain]);

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
          <h1 className="title">Please connect your wallet</h1>
        ) : errorMessage ? (
          <ErrorScreen
            buttonText="back to identities"
            onClick={() => router.push("/")}
            errorMessage="Well tried but ... you're not whitelisted"
          />
        ) : (
          <>
            <h1 className="title">Your Domain(s) to register</h1>
            <div className="w-3/5">
              {whitelistedDomains?.map((whitelistedDomain, index) => (
                <div key={index} className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    {whitelistedDomain?.domain}
                  </h2>
                  <div className="ml-5">
                    <SelectDomain
                      tokenId={tokenId}
                      changeTokenId={changeTokenId}
                    />
                  </div>
                  <Button onClick={() => register(whitelistedDomain?.domain)}>
                    Register
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Whitelist;
