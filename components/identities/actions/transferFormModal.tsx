import { Modal, TextField } from "@mui/material";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import styles from "../../../styles/components/modalMessage.module.css";
import { hexToDecimal } from "../../../utils/feltService";
import { isHexString } from "../../../utils/stringService";
import Button from "../../UI/button";
import { utils } from "starknetid.js";
import { StarknetIdJsContext } from "../../../context/StarknetIdJsProvider";

type TransferFormModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
};

const TransferFormModal: FunctionComponent<TransferFormModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const router = useRouter();
  const { address } = useAccount();
  const { tokenId } = router.query;
  const numId = parseInt(tokenId as string);
  const { addTransaction } = useTransactionManager();
  const [addressInput, setAddressInput] = useState<string>("");
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  //set_domain_to_address execute
  const transfer_identity_and_set_domain_multicall = [
    {
      contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      entrypoint: "set_domain_to_address",
      calldata: [...callDataEncodedDomain, hexToDecimal(targetAddress ?? "")],
    },
    {
      contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
      entrypoint: "transferFrom",
      calldata: [
        hexToDecimal(address ?? ""),
        hexToDecimal(targetAddress ?? ""),
        numId,
        0,
      ],
    },
  ];

  const { writeAsync: transfer_identity_and_set_domain, data: transferData } =
    useContractWrite({
      calls: transfer_identity_and_set_domain_multicall,
    });

  useEffect(() => {
    if (!transferData?.transaction_hash) return;
    addTransaction({ hash: transferData?.transaction_hash ?? "" });
    handleClose();
  }, [transferData]);

  useEffect(() => {
    if (isHexString(addressInput)) {
      setTargetAddress(addressInput);
    } else if (utils.isStarkDomain(addressInput)) {
      starknetIdNavigator?.getAddressFromStarkName(addressInput).then((res) => {
        if (!res || res === "0x0") setTargetAddress("");
        else setTargetAddress(res);
      });
    }
  }, [addressInput]);

  function transferIdentityAndSetDomain(): void {
    transfer_identity_and_set_domain();
  }

  function changeAddress(value: string): void {
    setAddressInput(value);
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
        <h2 className={styles.menu_title}>
          Move {domain} to a different address
        </h2>
        {address && (
          <p className="break-all mt-5">
            <strong>Current Address :</strong>&nbsp;
            <span>{address}</span>
          </p>
        )}
        {targetAddress && utils.isStarkDomain(addressInput) && (
          <p className="break-all mt-5">
            <strong>Target Address :</strong>&nbsp;
            <span>{targetAddress}</span>
          </p>
        )}
        <div className="mt-5 flex flex-col justify-center">
          <div className="mt-5">
            <TextField
              helperText="You need to copy paste a wallet address or .stark domain or it won't work"
              fullWidth
              label="new target address or .stark domain"
              id="outlined-basic"
              value={addressInput}
              variant="outlined"
              onChange={(e) => changeAddress(e.target.value)}
              color="secondary"
              required
            />
          </div>
          <div className="mt-5 flex justify-center">
            <Button
              disabled={!targetAddress}
              onClick={() => transferIdentityAndSetDomain()}
            >
              Send domain
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransferFormModal;
