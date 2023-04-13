import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/braavos.module.css";
import { gweiToEth } from "../../utils/feltService";
import {
  useAccount,
  useStarknetCall,
  useStarknetExecute,
} from "@starknet-react/core";
import { getDomainWithoutStark } from "../../utils/stringService";
import { useEncoded } from "../../hooks/naming";
import { useEtherContract } from "../../hooks/contracts";
import Button from "../../components/UI/button";
import { BN } from "bn.js";
import TwitterCta from "./twitterCta";

type BraavosRenewalProps = {
  domain: string;
};

const BraavosRenewal: FunctionComponent<BraavosRenewalProps> = ({ domain }) => {
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>("0");
  const price = "18000000000000000";

  // Renewing and shield minting
  const callDataRenew = [
    {
      contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
      entrypoint: "approve",
      calldata: [process.env.NEXT_PUBLIC_NAMING_CONTRACT as string, price, 0],
    },
    {
      contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      entrypoint: "renew",
      calldata: [
        useEncoded(getDomainWithoutStark(domain)).toString(10),
        2 * 365,
      ],
    },
    {
      contractAddress: process.env
        .NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
      entrypoint: "mint",
      calldata: [2],
    },
  ];

  const { execute: executeRenew, data: renewData } = useStarknetExecute({
    calls: callDataRenew,
  });

  function renew() {
    executeRenew();
  }

  useEffect(() => {
    if (balance) {
      if (gweiToEth(balance) > gweiToEth(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [balance]);

  const { contract: etherContract } = useEtherContract();
  const { data: userBalanceData, error: userBalanceDataError } =
    useStarknetCall({
      contract: etherContract,
      method: "balanceOf",
      args: [address],
    });

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("0");
    else {
      setBalance(
        userBalanceData?.["balance"].low
          .add(
            userBalanceData?.["balance"].high.mul(new BN(2).pow(new BN(128)))
          )
          .toString(10)
      );
    }
  }, [userBalanceData, userBalanceDataError]);

  return !renewData?.transaction_hash ? (
    <div className={styles.discountContainer}>
      <div className={styles.discountBuyImageContainer}>
        <img
          className={styles.discountBuyImage}
          src="/braavos/shieldLevel3.png"
        />
      </div>
      <div className={styles.registerContainer}>
        <h1 className={styles.titleRegister}>
          Renew your domain and Mint your Gold Shield Now !
        </h1>

        <div className="max-w-md">
          <p className="mb-5 text-justify">
            Gold Shield of Braavos (level 3) is only given to the long term
            supporter of the Starknet ID Community, that&apos;s the reason why
            if you renew your domain today to be part of the Starknet community
            for at least 2 years (cost 0.018 ETH).
          </p>
          <Button disabled={invalidBalance} onClick={renew}>
            {invalidBalance ? "You don't have enough eth" : `Renew ${domain}`}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <TwitterCta
      twitterLink={`https://twitter.com/intent/tweet?text=Just%20minted%20a%20Gold%20Shield%20of%20Braavos%20with%20my%20domain%20${domain}%20%F0%9F%9B%A1%EF%B8%8F%0A%0AGo%20mint%20yours%20on%20app.starknet.id%2Fbraavos%20!%0A%0ABe%20quick%2C%20it%20might%20not%20last%20forever%20%F0%9F%91%80`}
    />
  );
};

export default BraavosRenewal;
