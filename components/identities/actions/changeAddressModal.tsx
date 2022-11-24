import { Modal, TextField } from "@mui/material";
import { useStarknetExecute } from "@starknet-react/core";
import BN from "bn.js";
import React, { FunctionComponent, useEffect, useState } from "react";
import { namingContract } from "../../../hooks/contracts";
import { useAddressFromDomain } from "../../../hooks/naming";
import { isHexString } from "../../../hooks/string";
import styles from "../../../styles/components/wallets.module.css";
import Button from "../../UI/button";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string | undefined>();

  const { address: domainData, error: domainError } = useAddressFromDomain(
    domain ?? ""
  );

  useEffect(() => {
    if (domainError) {
      return;
    } else {
      if (domainData) {
        setOwnerAddress(domainData?.["address"].toString(16) as string);
      }
    }
  }, [domainData, domainError]);

  //set_domain_to_address execute
  const set_domain_to_address_calls = {
    contractAddress: namingContract,
    entrypoint: "set_domain_to_address",
    calldata: [
      ...callDataEncodedDomain,
      new BN(targetAddress?.slice(2), 16).toString(10),
    ],
  };

  const { execute: set_domain_to_address } = useStarknetExecute({
    calls: set_domain_to_address_calls,
  });

  function setDomainToAddress(): void {
    set_domain_to_address();
  }

  function changeAddress(e: any): void {
    isHexString(e.target.value) ? setTargetAddress(e.target.value) : null;
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
        <p className={styles.menu_title}>Change the redirection address</p>
        <div className="mt-5 flex flex-col justify-center">
          {ownerAddress && (
            <p className="break-all">
              <strong>Current Address :</strong>&nbsp;
              <span>{"0x" + ownerAddress}</span>
            </p>
          )}
          <div className="mt-5">
            <TextField
              helperText="You need to copy paste a wallet address or it won't work"
              fullWidth
              label="new target address"
              id="outlined-basic"
              value={targetAddress ?? "0x.."}
              variant="outlined"
              onChange={changeAddress}
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
