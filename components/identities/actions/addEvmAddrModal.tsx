import {
  ListItemText,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import { useContractWrite } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { isHexString } from "../../../utils/stringService";
import styles from "../../../styles/components/evmModalMessage.module.css";
import Button from "../../UI/button";
import { hexToDecimal } from "../../../utils/feltService";
import ConfirmationTx from "../../UI/confirmationTx";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import {
  EvmFieldsName,
  EvmFieldsType,
  NotificationType,
  TransactionType,
} from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import { shortString } from "starknet";

type AddEvmAddrModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  identity?: Identity;
};

const AddEvmAddrModal: FunctionComponent<AddEvmAddrModalProps> = ({
  handleClose,
  isModalOpen,
  identity,
}) => {
  const [evmAddress, setEvmAddress] = useState<string>(
    identity?.getUserDataWithField("evm-address") ?? ""
  );
  const [field, setField] = useState<EvmFields>("evm-address");
  const { addTransaction } = useNotificationManager();
  const [isTxSent, setIsTxSent] = useState(false);

  const { writeAsync: set_user_data, data: userData } = useContractWrite({
    calls: identity
      ? [
          identityChangeCalls.setUserData(
            identity.id,
            shortString.encodeShortString(field),
            hexToDecimal(evmAddress)
          ),
        ]
      : [],
  });

  useEffect(() => {
    if (!userData?.transaction_hash) return;
    console.log("field", field);
    console.log("evmAddress added", evmAddress);
    addTransaction({
      timestamp: Date.now(),
      subtext: `${field} update for ${identity?.domain}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.SET_USER_DATA,
        hash: userData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]); // We want to execute this only once when the tx is sent

  function setUserData(): void {
    set_user_data();
  }

  function changeAddress(value: string): void {
    isHexString(value) ? setEvmAddress(value) : null;
  }

  function changeField(value: EvmFields): void {
    setField(value);
    const existingAddr = identity?.getUserDataWithField(value);
    if (existingAddr) setEvmAddress(existingAddr);
    else setEvmAddress(identity?.getUserDataWithField("evm-address") ?? "");
  }

  function closeModal(): void {
    setIsTxSent(false);
    handleClose();
  }

  const selectStyle = {
    "& .MuiSelect-select": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "12px 16px",
      gap: "8px",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "24px",
    },
    "& .css-10hburv-MuiTypography-root": {
      fontFamily: "Poppins-Regular",
    },
  };

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
        {isTxSent ? (
          <ConfirmationTx
            closeModal={closeModal}
            txHash={userData?.transaction_hash}
          />
        ) : (
          <div className={styles.menu}>
            <button className={styles.menu_close} onClick={closeModal}>
              <svg viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <p className={styles.menu_subtitle}>Add a EVM address for</p>
            <p className={styles.menu_title}>{identity?.domain}</p>
            <div className="mt-5 flex flex-col justify-center">
              <div className="">
                <Select
                  fullWidth
                  value={field}
                  defaultValue={field}
                  inputProps={{ MenuProps: { disableScrollLock: true } }}
                  onChange={(e) => changeField(e.target.value as EvmFields)}
                  style={{
                    borderRadius: "8.983px",
                  }}
                  sx={selectStyle}
                >
                  {Object.values(EvmFieldsType).map((evmField) => {
                    return (
                      <MenuItem key={evmField} value={evmField}>
                        <ListItemText primary={EvmFieldsName[evmField]} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
              <div className="mt-5">
                <TextField
                  helperText="You need to copy paste a wallet address or it won't work"
                  fullWidth
                  label="new address"
                  id="outlined-basic"
                  value={evmAddress}
                  variant="outlined"
                  onChange={(e) => changeAddress(e.target.value)}
                  color="secondary"
                  required
                />
              </div>
              <div className="mt-5 flex justify-center">
                <div>
                  <Button
                    disabled={!evmAddress || !field}
                    onClick={() => setUserData()}
                  >
                    Set EVM address
                  </Button>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div>
                  <h3 className={styles.cardTitle}>
                    Why Add an EVM Address to Your Starknet Domain?
                  </h3>
                  <p className={styles.cardDesc}>
                    By adding an EVM address to your Starknet domain, you
                    enhance its functionality and connectivity. Your Starknet
                    domain automatically comes with an associated ENS subdomain,
                    simplifying ENS management. Configure your EVM address in
                    your preferred wallet for seamless integration.
                  </p>
                </div>
                <img
                  src="/visuals/ecosystemMap.webp"
                  className={styles.cardImg}
                />
              </div>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default AddEvmAddrModal;