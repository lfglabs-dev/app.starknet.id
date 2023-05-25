import { Modal, TextField } from "@mui/material";
import { useContractRead, useContractWrite } from "@starknet-react/core";
import BN from "bn.js";
import React, { FunctionComponent, useEffect, useState } from "react";
import { usePricingContract } from "../../../hooks/contracts";
import styles from "../../../styles/components/wallets.module.css";
import styles2 from "../../../styles/Home.module.css";
import Button from "../../UI/button";
import { timestampToReadableDate } from "../../../utils/dateService";
import { Abi } from "starknet";

type AutoRenewalModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
  isEnabled?: boolean;
};

const AutoRenewalModal: FunctionComponent<AutoRenewalModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
  isEnabled,
}) => {
  const [price, setPrice] = useState<string>("0");
  const { contract: pricingContract } = usePricingContract();
  const { data: priceData, error: priceError } = useContractRead({
    address: pricingContract?.address as string,
    abi: pricingContract?.abi as Abi,
    functionName: "compute_renew_price",
    args: [callDataEncodedDomain[1], 365],
  });

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

  const renew_calls = [
    {
      contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
      entrypoint: "approve",
      calldata: [
        process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
        isEnabled ? 0 : price,
        0,
      ],
    },
    {
      contractAddress: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      entrypoint: "toggle_renewals",
      calldata: [callDataEncodedDomain[1]],
    },
  ];

  const { writeAsync: enableAutoRenewal } = useContractWrite({
    calls: renew_calls,
  });

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.menu}>
        <button className={styles.menu_close} onClick={handleClose}>
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <p className={styles.menu_title}>
          {isEnabled ? "Disable" : "Enable"} auto renewal for {identity?.domain}
        </p>
        <p className="break-all mt-5">
          To avoid loosing your domain, you can enable auto renewals so your
          domain is renewed automatically. Auto renewals happen one month before
          you're expiry date is reached.
        </p>
        <div className="mt-5 flex flex-col justify-center">
          {identity?.domain_expiry && (
            <p className="break-all">
              <strong>Expiry date :</strong>&nbsp;
              <span>
                {timestampToReadableDate(identity?.domain_expiry ?? 0)}
              </span>
            </p>
          )}
          {identity?.domain_expiry && (
            <p className="break-all">
              <strong>Auto renewal date :</strong>&nbsp;
              <span>
                {timestampToReadableDate(
                  identity?.domain_expiry - 2592000 ?? 0
                )}
              </span>
            </p>
          )}
          <div className={styles2.cardCenter}>
            <p className="text">
              Price :&nbsp;
              <span className="font-semibold text-brown">
                {Math.round(Number(price) * 0.000000000000000001 * 10000) /
                  10000}
                &nbsp; ETH
              </span>
            </p>
          </div>
          <div className="mt-5 flex justify-center">
            <Button
              onClick={() => {
                enableAutoRenewal();
              }}
            >
              {isEnabled ? "Disable" : "Enable"} auto renewal
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AutoRenewalModal;
