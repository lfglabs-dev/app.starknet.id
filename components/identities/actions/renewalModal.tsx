import { Modal, TextField } from "@mui/material";
import {
  useAccount,
  useStarknetCall,
  useStarknetExecute,
} from "@starknet-react/core";
import BN from "bn.js";
import React, { FunctionComponent, useEffect, useState } from "react";
import { usePricingContract } from "../../../hooks/contracts";
import { Identity } from "../../../pages/identities/[tokenId]";
import styles from "../../../styles/components/wallets.module.css";
import styles2 from "../../../styles/Home.module.css";
import { timeStampToDate } from "../../../utils/dateService";
import Button from "../../UI/button";
import { getYearlyPriceFromDomain } from "../../../utils/priceService";

type RenewalModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
};

const RenewalModal: FunctionComponent<RenewalModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
}) => {
  const [duration, setDuration] = useState<number>(1);
  const maxYearsToRegister = 25;
  const [price, setPrice] = useState<string>("0");
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState<number>(
    Math.round(getYearlyPriceFromDomain(identity?.domain ?? "") * 1000) / 1000
  );
  const { contract: pricingContract } = usePricingContract();
  const { data: priceData, error: priceError } = useStarknetCall({
    contract: pricingContract,
    method: "compute_buy_price",
    args: [callDataEncodedDomain[1], duration * 365],
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

  useEffect(() => {
    setPriceWithoutDiscount(
      Math.round(
        duration * getYearlyPriceFromDomain(identity?.domain ?? "") * 1000
      ) / 1000
    );
  }, [duration]);

  //  renew execute
  const renew_calls = [
    {
      contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
      entrypoint: "approve",
      calldata: [process.env.NEXT_PUBLIC_NAMING_CONTRACT as string, price, 0],
    },
    {
      contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      entrypoint: "renew",
      calldata: [callDataEncodedDomain[1], duration * 365],
    },
  ];

  const { execute: renew } = useStarknetExecute({
    calls: renew_calls,
  });

  function changeDuration(e: any): void {
    setDuration(e.target.value);
  }

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
        <p className={styles.menu_title}>Renew {identity?.domain}</p>
        <div className="mt-5 flex flex-col justify-center">
          {identity?.domain_expiry && (
            <p className="break-all">
              <strong>Expiry date :</strong>&nbsp;
              <span>{timeStampToDate(identity?.domain_expiry)}</span>
            </p>
          )}
          <div className="mt-5">
            <TextField
              fullWidth
              id="outlined-basic"
              label="years"
              type="number"
              placeholder="years"
              variant="outlined"
              onChange={changeDuration}
              InputProps={{
                inputProps: { min: 0, max: maxYearsToRegister },
              }}
              defaultValue={duration}
              color="secondary"
              required
            />
          </div>
          <div className={styles2.cardCenter}>
            <p className="text">
              Price :
              {duration >= 3 ? (
                <span className="line-through text-soft-brown">{`${priceWithoutDiscount} ETH`}</span>
              ) : null}
              &nbsp;
              <span className="font-semibold text-brown">
                {Math.round(Number(price) * 0.000000000000000001 * 10000) /
                  10000}
                ETH
              </span>
            </p>
          </div>
          <div className="mt-5 flex justify-center">
            <Button disabled={!duration || !price} onClick={() => renew()}>
              Set new address
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RenewalModal;
