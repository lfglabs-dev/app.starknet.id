import { Modal, Tooltip } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../../styles/components/icons.module.css";
import modalStyles from "../../../../styles/components/modalMessage.module.css";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";
import "@anima-protocol/personhood-sdk-react/style.css";
import {
  Personhood,
  StarknetSignature,
} from "@anima-protocol/personhood-sdk-react";
import AnimaIcon from "../../../UI/iconsComponents/icons/animaIcon";
import { Call, useAccount, useTransactionManager } from "@starknet-react/core";
import { shortString, typedData } from "starknet";
import { useContractWrite } from "@starknet-react/core";
import { hexToDecimal } from "../../../../utils/feltService";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import theme from "../../../../styles/theme";

type ClickablePersonhoodIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickablePersonhoodIcon: FunctionComponent<
  ClickablePersonhoodIconProps
> = ({ width, tokenId, isOwner, domain }) => {
  const { account, address } = useAccount();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useTransactionManager();
  const { writeAsync: execute, data: verifierData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(
        parseInt(tokenId),
        "proof_of_personhood",
        process.env.NEXT_PUBLIC_VERIFIER_POP_CONTRACT
      )
      .then((response) => {
        if (response.toString(10) !== "0") {
          setIsVerified(true);
        }
      })
      .catch(() => {
        return;
      });
  }, [starknetIdNavigator]);

  useEffect(() => {
    if (!verifierData?.transaction_hash) return;
    addTransaction({ hash: verifierData?.transaction_hash });
  }, [verifierData]);

  useEffect(() => {
    if (callData && callData.length > 0 && !isVerified && isLoading) {
      executeVerification();
    }
  }, [isLoading, callData]);

  const startVerification = () => {
    if (!isVerified) {
      initAnimaSession();
      setIsOpen(true);
    }
  };

  const initAnimaSession = () => {
    fetch("/api/anima/init_session")
      .then((response) => response.json())
      .then((result) => {
        if (result && result.session_id) setSessionId(result.session_id);
      })
      .catch((error) =>
        console.log(
          "An error occured while initializing a new Anima session",
          error
        )
      );
  };

  const sign = useCallback(
    (payload: string | object) => {
      return account?.signMessage(payload as typedData.TypedData) as Promise<
        string | StarknetSignature
      >;
    },
    [account]
  );

  const onFinish = useCallback(
    (e: { info: any; state: any }) => {
      setIsLoading(true);
      getSignature();
    },
    [sessionId]
  );

  const executeVerification = () => {
    execute()
      .catch((err) => {
        console.log("An error occurred while executing transaction", err);
      })
      .finally(() => {
        setCallData([]);
        setIsVerified(true);
        setIsLoading(false);
        setIsOpen(false);
      });
  };

  const getSignature = () => {
    fetch(`/api/anima/get_signature?sessionId=${sessionId}`)
      .then((response) => response.json())
      .then((sig) => {
        const hexSessionId = "0x" + (sessionId as string).replace(/-/g, "");
        setCallData([
          {
            contractAddress: process.env
              .NEXT_PUBLIC_VERIFIER_POP_CONTRACT as string,
            entrypoint: "write_confirmation",
            calldata: [
              tokenId,
              Date.now(),
              shortString.encodeShortString("proof_of_personhood"),
              hexToDecimal(hexSessionId),
              sig.r,
              sig.s,
            ],
          },
        ]);
      })
      .catch((error) =>
        console.log("An error occured while fetching signture", error)
      );
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return isOwner ? (
    address && account ? (
      <>
        <Tooltip
          title={
            isVerified
              ? `Your proof of personhood (the fact that you are not a robot) is verified !`
              : `Start proof of personhood verification`
          }
          arrow
        >
          <div
            className={styles.clickableIconAnima}
            onClick={startVerification}
          >
            {isVerified ? (
              <div className={styles.verifiedIcon}>
                <VerifiedIcon width={"18"} color={theme.palette.primary.main} />
              </div>
            ) : null}
            <AnimaIcon width={width} color={"white"} />
          </div>
        </Tooltip>
        {isOpen && (
          <Modal
            disableAutoFocus
            disableEnforceFocus
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ zIndex: 900 }}
          >
            <div className={modalStyles.menu}>
              <button className={modalStyles.menu_close} onClick={handleClose}>
                <svg viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <h2 className={modalStyles.menu_title}>
                Start your proof of personhood verification
              </h2>
              <p className="mt-5 text-justify">
                Prove your humanity on your Starknet ID ! We use{" "}
                <a
                  href="https://anima.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Anima
                </a>{" "}
                to verify that you are a human and not a bot.
              </p>
              <p className="mt-3 text-justify">
                Once this verification is completed you’ll be able to show to
                any Starknet app that you are human and you’ll get all the
                benefit associated with it ! This process will only verify you
                humanity and not your identity. Starknet ID or Anima don’t store
                any data.
              </p>
              <div className="mt-5 flex flex-row justify-center">
                <div className="space-around lg:w-1/2">
                  <Personhood
                    sessionId={sessionId as string}
                    onFinish={onFinish}
                    signCallback={sign}
                    walletAddress={address}
                    starknetChainId={account.chainId}
                    chainType="STARKNET"
                  />
                </div>
              </div>
            </div>
          </Modal>
        )}
      </>
    ) : null
  ) : isVerified ? (
    <Tooltip title={`${minifyDomain(domain)} is verified`} arrow>
      <div className={styles.clickableIconAnima}>
        <AnimaIcon width={width} color="white" />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
