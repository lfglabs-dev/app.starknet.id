import { Modal, TextField } from "@mui/material";
import { useStarknetExecute } from "@starknet-react/core";
import { BN } from "bn.js";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Call } from "starknet/types";
import { namingContract, starknetIdContract } from "../../../hooks/contracts";
import { useEncoded } from "../../../hooks/naming";
import styles from "../../../styles/components/wallets.module.css";
import SelectDomain from "../../domains/selectDomains";
import Button from "../../UI/button";

type SubdomainModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
};

const SubdomainModal: FunctionComponent<SubdomainModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
}) => {
  const [targetTokenId, setTargetTokenId] = useState<number>(0);
  const [subdomain, setSubdomain] = useState<string>();
  const encodedSubdomain: string = useEncoded(subdomain ?? "").toString(10);
  const [callData, setCallData] = useState<Call[]>([]);

  const { execute: transfer_domain } = useStarknetExecute({
    calls: callData as any,
  });

  function changeTokenId(e: any): void {
    setTargetTokenId(Number(e.target.value));
  }

  function changeSubdomain(e: any): void {
    setSubdomain(e.target.value);
  }

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (targetTokenId != 0) {
      setCallData([
        {
          contractAddress: namingContract,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            targetTokenId,
          ],
        },
      ]);
    } else {
      setCallData([
        {
          contractAddress: starknetIdContract,
          entrypoint: "mint",
          calldata: [new BN(newTokenId).toString(10)],
        },
        {
          contractAddress: namingContract,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            newTokenId,
          ],
        },
      ]);
    }
  }, [targetTokenId, encodedSubdomain, callDataEncodedDomain]);

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
        <h2 className={styles.menu_title}>Create a subdomain of {domain}</h2>
        <div className="mt-5 flex flex-col justify-center">
          <TextField
            fullWidth
            id="outlined-basic"
            label="Subdomain"
            placeholder="Subdomain"
            variant="outlined"
            onChange={changeSubdomain}
            color="secondary"
            required
          />
          <SelectDomain tokenId={targetTokenId} changeTokenId={changeTokenId} />
          <div className="mt-5 flex justify-center">
            <Button disabled={!subdomain} onClick={() => transfer_domain()}>
              Create subdomain
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SubdomainModal;
