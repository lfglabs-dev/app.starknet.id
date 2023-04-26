import { Modal, TextField } from "@mui/material";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Call } from "starknet";
import { useIsValid } from "../../../hooks/naming";
import styles from "../../../styles/components/wallets.module.css";
import { hexToDecimal } from "../../../utils/feltService";
import { numberToString } from "../../../utils/stringService";
import SelectDomain from "../../domains/selectDomains";
import Button from "../../UI/button";
import { utils } from "starknetid.js";

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
  const encodedSubdomain: string = utils
    .encodeDomain(subdomain)[0]
    .toString(10);
  const isDomainValid = useIsValid(subdomain);
  const [callData, setCallData] = useState<Call[]>([]);
  const { address } = useAccount();

  const { execute: transfer_domain } = useStarknetExecute({
    calls: callData as any,
  });

  function changeTokenId(value: number): void {
    setTargetTokenId(value);
  }

  function changeSubdomain(value: string): void {
    setSubdomain(value);
  }

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (targetTokenId != 0) {
      setCallData([
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            targetTokenId,
          ],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_domain_to_address",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            hexToDecimal(address),
          ],
        },
      ]);
    } else {
      setCallData([
        {
          contractAddress: process.env
            .NEXT_PUBLIC_STARKNETID_CONTRACT as string,
          entrypoint: "mint",
          calldata: [numberToString(newTokenId)],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            newTokenId,
          ],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_domain_to_address",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            hexToDecimal(address ?? ""),
          ],
        },
      ]);
    }
  }, [targetTokenId, encodedSubdomain, callDataEncodedDomain, address]);

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
            label={
              isDomainValid != true
                ? `"${isDomainValid}" is not a valid character`
                : "Subdomain"
            }
            placeholder="Subdomain"
            variant="outlined"
            onChange={(e) => changeSubdomain(e.target.value)}
            color="secondary"
            required
            error={isDomainValid != true}
          />
          <SelectDomain tokenId={targetTokenId} changeTokenId={changeTokenId} />
          <div className="mt-5 flex justify-center">
            <Button
              disabled={
                Boolean(!subdomain) || typeof isDomainValid === "string"
              }
              onClick={() => transfer_domain()}
            >
              Create subdomain
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SubdomainModal;
