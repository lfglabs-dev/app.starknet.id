import React, { useState } from "react";
import { FunctionComponent } from "react";
import { Identity } from "../../../utils/apiWrappers/identity";
import { Tooltip } from "@mui/material";
import { getDomainWithoutStark, getEnsFromStark } from "@/utils/stringService";
import EditIcon from "@/components/UI/iconsComponents/icons/editIcon";
import AddEvmAddrModal from "./addEvmModal";
import Notification from "@/components/UI/notification";
import styles from "../../../styles/components/identityCard.module.css";
import theme from "@/styles/theme";
import PlusIcon from "@/components/UI/iconsComponents/icons/plusIcon";

type AddEvmActionProps = {
  identity?: Identity;
  isOwner?: boolean;
};

const AddEvmAction: FunctionComponent<AddEvmActionProps> = ({
  identity,
  isOwner = false,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [addrAdded, setAddrAdded] = useState(false);

  const closeModal = (showNotif: boolean) => {
    setOpenModal(false);
    if (showNotif) {
      setAddrAdded(true);
      setTimeout(() => {
        setAddrAdded(false);
      }, 1500);
    }
  };

  return (
    <>
      {identity?.domain ? (
        identity?.evmAddress ? (
          <div className={styles.evmAddr}>
            <Tooltip
              title="Check on ENS"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#454545",
                  },
                },
              }}
            >
              <div
                className={styles.evmName}
                onClick={() =>
                  window.open(
                    `https://app.ens.domains/${getDomainWithoutStark(
                      identity?.domain
                    )}.snid.eth`
                  )
                }
              >
                <img
                  className={styles.evmIcon}
                  src="/icons/ens.svg"
                  alt="ENS Icon"
                />
                <h2>{getEnsFromStark(identity.domain)}</h2>
              </div>
            </Tooltip>
            {isOwner ? (
              <Tooltip
                title="Edit your EVM address"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "#454545",
                    },
                  },
                }}
              >
                <div
                  onClick={() => setOpenModal(true)}
                  className={styles.editIcon}
                >
                  <EditIcon width="16" color={theme.palette.secondary.main} />
                </div>
              </Tooltip>
            ) : null}
          </div>
        ) : isOwner ? (
          <div className={styles.evmAddrBtn} onClick={() => setOpenModal(true)}>
            <img
              className={styles.evmIcon}
              src="/icons/ens.svg"
              alt="ENS Icon"
            />
            <h2>Add EVM address</h2>
            <PlusIcon width="12" color={theme.palette.secondary.main} />
          </div>
        ) : null
      ) : null}
      <AddEvmAddrModal
        handleClose={(showNotif) => closeModal(showNotif)}
        isModalOpen={openModal}
        identity={identity}
      />
      <Notification visible={addrAdded} severity="success">
        <>&nbsp;Your address was added!</>
      </Notification>
    </>
  );
};

export default AddEvmAction;
