import { Modal, Tooltip, CircularProgress } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import styles from "../../../../styles/components/icons.module.css";
import modalStyles from "../../../../styles/components/modalMessage.module.css";
import "@anima-protocol/personhood-sdk-react/style.css";
import {
  Personhood,
  StarknetSignature,
} from "@anima-protocol/personhood-sdk-react";
import { useAccount } from "@starknet-react/core";
import { Call, constants, typedData } from "starknet";
import { useContractWrite } from "@starknet-react/core";
import { hexToDecimal } from "../../../../utils/feltService";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import theme from "../../../../styles/theme";
import { posthog } from "posthog-js";
import ProfilSecurityIcon from "../../../UI/iconsComponents/icons/profilSecurityIcon";
import identityChangeCalls from "../../../../utils/callData/identityChangeCalls";
import { useNotificationManager } from "../../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../../utils/constants";

type ClickablePersonhoodIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain?: string;
  isVerified?: boolean;
};

const ClickablePersonhoodIcon: FunctionComponent<
  ClickablePersonhoodIconProps
> = ({ width, tokenId, isOwner, domain, isVerified }) => {
  const { account, address } = useAccount();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [callData, setCallData] = useState<Call>();
  const { addTransaction } = useNotificationManager();
  const { writeAsync: execute, data: verifierData } = useContractWrite({
    calls: [callData as Call],
  });
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";

  useEffect(() => {
    if (!verifierData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: "Proof of personhood",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.VERIFIER_POP,
        hash: verifierData.transaction_hash,
        status: "pending",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifierData]); // We want to execute this only once when the tx is sent

  useEffect(() => {
    const executeVerification = () => {
      execute().finally(() => {
        setCallData(undefined);
        setIsLoading(false);
        setIsOpen(false);
        setSessionId(undefined);
      });
    };

    if (callData && !isVerified && isLoading) {
      executeVerification();
    }
  }, [isLoading, callData, isVerified, execute]);

  const startVerification = () => {
    if (!isVerified) {
      posthog?.capture("popVerificationStart");
      initAnimaSession();
      setIsOpen(true);
    }
  };

  const initAnimaSession = () => {
    fetch(`/api/anima/init_session?address=${address}`)
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

  const onFinish = useCallback(() => {
    setIsLoading(true);
    getSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const getSignature = () => {
    fetch(`/api/anima/get_signature?sessionId=${sessionId}`)
      .then((response) => response.json())
      .then((sig) => {
        const hexSessionId = "0x" + (sessionId as string).replace(/-/g, "");
        setCallData(
          identityChangeCalls.writeVerifierData(
            process.env.NEXT_PUBLIC_VERIFIER_POP_CONTRACT as string,
            tokenId,
            Math.floor(Date.now() / 1000 + 15 * 60),
            "proof_of_personhood",
            hexToDecimal(hexSessionId),
            [sig.r, sig.s]
          )
        );
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
            <ProfilSecurityIcon
              width={width}
              color={theme.palette.secondary.main}
            />
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
                Start your proof of personhood verification and verify your
                humanity on your Starknet ID! We use{" "}
                <a
                  href="https://anima.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Anima
                </a>{" "}
                to make sure you are a human and not a robot. Anima performs a
                webcam face scan to generate a distinct, non-reversible
                facehash. This process is not mandatory and you should not
                expect any reward for completing it.
              </p>
              <p className="mt-3 text-justify">
                This facehash prevents a single face from verifying multiple IDs
                and, crucially, cannot be used to extract any biometric
                information.
              </p>
              <div className="mt-5 flex flex-row justify-center">
                <div className="space-around lg:w-1/2">
                  {sessionId ? (
                    <Personhood
                      sessionId={sessionId as string}
                      onFinish={onFinish}
                      signCallback={sign}
                      walletAddress={address}
                      starknetChainId={
                        network === "testnet"
                          ? constants.StarknetChainId.SN_SEPOLIA
                          : constants.StarknetChainId.SN_MAIN
                      }
                      chainType="STARKNET"
                    />
                  ) : (
                    <div className="pop-bg-primary-500 pop-p-4 pop-w-full pop-min-w-[210px] pop-whitespace-normal pop-text-white pop-rounded-xl">
                      <div className="pop-flex pop-flex-row pop-items-center pop-justify-between">
                        <p className="ml-10">Loading</p>
                        <div className="flex justify-center items-center">
                          <CircularProgress
                            sx={{
                              color: "white",
                            }}
                            size={25}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </>
    ) : null
  ) : isVerified ? (
    <Tooltip title={`${minifyDomain(domain ?? "")} is a human`} arrow>
      <div className={styles.clickableIconAnima}>
        <ProfilSecurityIcon
          width={width}
          color={theme.palette.secondary.main}
        />
        <div className={styles.verifiedIcon}>
          <VerifiedIcon width={"24"} color={theme.palette.primary.main} />
        </div>
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
