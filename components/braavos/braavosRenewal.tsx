import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/braavos.module.css";
import { gweiToEth } from "../../utils/feltService";
import {
  useAccount,
  useContractWrite,
  useContractRead,
} from "@starknet-react/core";
import { useEtherContract } from "../../hooks/contracts";
import Button from "../UI/button";
import BraavosConfirmation from "./braavosConfirmation";
import Link from "next/link";
import { utils } from "starknetid.js";
import { Abi } from "starknet";

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
      calldata: [utils.encodeDomain(domain).toString(), 3 * 365, 0],
    },
    {
      contractAddress: process.env
        .NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
      entrypoint: "mint",
      calldata: [2],
    },
  ];

  const { writeAsync: executeRenew, data: renewData } = useContractWrite({
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
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "balanceOf",
      args: [address],
    });

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("0");
    else {
      const high = userBalanceData?.["balance"].high << BigInt(128);
      setBalance((userBalanceData?.["balance"].low + high).toString(10));
    }
  }, [userBalanceData, userBalanceDataError]);

  return !renewData?.transaction_hash ? (
    <div className={styles.discountContainer}>
      <div className={styles.discountBuyImageContainer}>
        <img
          className={styles.discountBuyImage}
          src="/braavos/shieldlevel3.webp"
        />
      </div>
      <div className={styles.registerContainer}>
        <h1 className={styles.titleRegister}>
          Renew you domain with a -33% discount to receive the Gold Shield of
          Braavos Now !
        </h1>

        <div className="max-w-md">
          <p className="mb-5 text-justify">
            Gold Shield of Braavos (level 3) is only given to the long term
            supporter of Starknet ID ! Renew your Stark name for 3 years but pay
            for only 2 years{" "}
            <strong>
              (0.018 ETH instead of 0.027 ETH for +5 letters domains only)
            </strong>{" "}
            and receive automatically the Gold Shield of Braavos. This offer is
            only available until April 20th, 12:00 p.m. UTC.
          </p>
          <Button disabled={invalidBalance} onClick={renew}>
            {invalidBalance
              ? "You don't have enough eth"
              : `Renew ${domain} now !`}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <BraavosConfirmation
      confirmationText={
        <p className="mb-5 text-justify">
          Thanks, the transaction is on going. Once the transaction will be
          completed:{" "}
          <ul className="list-disc list-outside">
            <li className="ml-5">
              Check your NFT gallery to see the Golden Shied of Braavos after 2
              minutes
            </li>
            <li className="ml-5">
              Check the new expiry date of your domain after 5 minutes on&nbsp;
              <Link href="/identities" className="underline">
                the identities page
              </Link>{" "}
              click on &quot;Renew your Identity&quot; to see the expiry date
            </li>
          </ul>
        </p>
      }
      title={`Congrats, you just minted your gold shield with ${domain} !`}
      imageSrc={"/braavos/shieldlevel3.webp"}
    />
  );
};

export default BraavosRenewal;
