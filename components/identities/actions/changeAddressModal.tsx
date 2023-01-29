import { Modal, TextField } from "@mui/material";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import BN from "bn.js";
import React, { FunctionComponent, useState } from "react";
import { hexToDecimal, isHexString } from "../../../utils/stringService";
import styles from "../../../styles/components/wallets.module.css";
import { stringDecimalToHex } from "../../../utils/felt";
import Button from "../../UI/button";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
  currentTargetAddress?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
  currentTargetAddress = "0",
}) => {
  const { address } = useAccount();
  const [targetAddress, setTargetAddress] = useState<string>("");

  //set_domain_to_address execute
  const set_domain_to_address_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_domain_to_address",
    calldata: [...callDataEncodedDomain, hexToDecimal(targetAddress ?? "")],
  };

  const { execute: set_domain_to_address } = useStarknetExecute({
    calls: set_domain_to_address_calls,
  });

  function setDomainToAddress(): void {
    set_domain_to_address();
  }

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
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
        <p className={styles.menu_title}>
          Change the target address of {domain}
        </p>
        <div className="mt-5 flex flex-col justify-center">
          {currentTargetAddress && (
            <p className="break-all">
              <strong>Current Address :</strong>&nbsp;
              <span>{"0x" + stringDecimalToHex(currentTargetAddress)}</span>
            </p>
          )}
          <div className="mt-5">
            <TextField
              helperText="You need to copy paste a wallet address or it won't work"
              fullWidth
              label="new target address"
              id="outlined-basic"
              value={targetAddress ?? address}
              variant="outlined"
              onChange={(e) => changeAddress(e.target.value)}
              color="secondary"
              required
            />
          </div>
          <div className="mt-5 flex justify-center">
            <Button
              disabled={!targetAddress}
              onClick={() => setDomainToAddress()}
            >
              Set new address
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeAddressModal;
