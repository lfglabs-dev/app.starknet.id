import {
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import OptionIcon from "../UI/iconsComponents/icons/optionIcon";
import styles from "../../styles/solana.module.css";
import { Abi, Call } from "starknet";
import { useAccount, useContractRead } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import SolanaCalls from "../../utils/callData/solanaCalls";
import { utils } from "starknetid.js";
import ChangeAddressModal from "./changeAddressModal";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";
import ConfirmationTx from "../UI/confirmationTx";
import { useNamingContract } from "../../hooks/contracts";
import { decimalToHex } from "../../utils/feltService";

type DomainActionsProps = {
  name: string;
};

const DomainActions: FunctionComponent<DomainActionsProps> = ({ name }) => {
  const { address } = useAccount();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { addTransaction } = useNotificationManager();
  const [isTxSent, setIsTxSent] = useState(false);
  const [mainDomainCalldata, setMainDomainCalldata] = useState<Call[]>([]);
  const { writeAsync: executeMainDomain, data: mainDomainData } =
    useContractWrite({
      calls: mainDomainCalldata,
    });
  const { contract } = useNamingContract();
  const encodedDomain = utils
    .encodeDomain(`${name}.sol.stark`)
    .map((x) => x.toString());
  const { data: resolveData } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "domain_to_address",
    args: [encodedDomain, []],
  });

  useEffect(() => {
    setMainDomainCalldata([
      SolanaCalls.setAsMainDomain(utils.encodeDomain(name)[0].toString()),
    ]);
  }, [name, address]);

  useEffect(() => {
    if (!mainDomainData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Set ${name}.sol.stark as main domain`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.MAIN_DOMAIN,
        hash: mainDomainData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainDomainData]); // We want to execute this only once when the tx is sent

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const setAsMainDomain = (event: Event | React.SyntheticEvent) => {
    handleClose(event);
    executeMainDomain();
  };

  const changeTargetAddress = (event: Event | React.SyntheticEvent) => {
    handleClose(event);
    setOpenModal(true);
  };

  return (
    <div>
      {isTxSent ? (
        <ConfirmationTx
          closeModal={() => setOpenModal(false)}
          txHash={mainDomainData?.transaction_hash}
        />
      ) : (
        <>
          <div
            className={styles.domainSelect}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <OptionIcon width="16" color="#6D696A" />
          </div>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
            className={styles.domainActionsMenu}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-start" ? "left top" : "left bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem
                        onClick={(e) => changeTargetAddress(e)}
                        className={styles.menuItem}
                      >
                        Change target address
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => setAsMainDomain(e)}
                        className={styles.menuItem}
                      >
                        Set as main domain
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </>
      )}
      <ChangeAddressModal
        handleClose={() => setOpenModal(false)}
        isModalOpen={openModal}
        domain={name}
        currentTargetAddress={decimalToHex((resolveData as string) ?? "0")}
      />
    </div>
  );
};

export default DomainActions;
