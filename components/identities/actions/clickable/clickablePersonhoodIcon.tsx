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

type ClickableGithubIconProps = {
  width: string;
  tokenId: string;
  isOwner: boolean;
  domain: string;
};

const ClickablePersonhoodIcon: FunctionComponent<ClickableGithubIconProps> = ({
  width,
  tokenId,
  isOwner,
  domain,
}) => {
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
    const myHeaders = new Headers();
    myHeaders.append(
      "Api-Key",
      process.env.NEXT_PUBLIC_ANIMA_API_KEY as string
    );
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
    };

    fetch("https://api.pop.anima.io/v1/personhood/init", requestOptions)
      .then((response) => response.json())
      .then((result) => setSessionId(result.session_id))
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
      });
  };

  const getSignature = () => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Api-Key",
      process.env.NEXT_PUBLIC_ANIMA_API_KEY as string
    );
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ session_id: sessionId as string }),
    };

    fetch(
      "https://api.pop.anima.io/v1/personhood/sign/starknet",
      requestOptions
    )
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
              ? `You're verified !`
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
            disablePortal={true}
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
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
                We use Anima.io to prove humanity and uniqueness. Anima is
                privacy preserving, it does not collect any private data.
              </p>
              <p className="mt-3 text-justify">
                Once you have completed the liveliness challenge, the signature
                generated will be sent to a{" "}
                <a
                  href={`https://starkscan.co/contract/${process.env.NEXT_PUBLIC_VERIFIER_POP_CONTRACT}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  verifier contract
                </a>
                . It will verify the signature is correct and write to
                you&apos;re StarknetID your a human.
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
