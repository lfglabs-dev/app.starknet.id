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
import { Call, useAccount } from "@starknet-react/core";
import { typedData } from "starknet";
import { useContractWrite } from "@starknet-react/core";
import { hexToDecimal } from "../../../../utils/feltService";

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
  const [callData, setCallData] = useState<Call[]>([]);
  const { writeAsync: execute } = useContractWrite({
    calls: callData,
  });

  console.log("sessionId", sessionId);

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(tokenId, "personhood")
      .then((response) => {
        console.log(
          "fetched synapseId from contract",
          response,
          response.toString(10)
        );
        if (response.toString(10) !== "0") {
          setIsVerified(true);
          setCallData([]);
        }
      })
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    if (callData && callData.length > 0 && !isVerified) {
      execute()
        .then(() => {
          // handleClose();
          // todo: handle ongoing tx
        })
        .catch((error) => {
          setCallData([]);
        })
        .finally(() => {
          setCallData([]);
          setIsVerified(true);
        });
    }
  }, [callData]);

  const startVerification = () => {
    initAnimaSession();
    setIsOpen(true);
  };

  const initAnimaSession = () => {
    console.log("Initializing new anima session");
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
      .catch((error) => console.log("error", error));
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
      getSignature();
    },
    [sessionId]
  );

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
        console.log("sessionId", sessionId);
        let hexSessionId = "0x" + (sessionId as string).replace(/-/g, "");
        console.log("hexSessionId", hexSessionId);
        let test_dec = hexToDecimal(hexSessionId);
        console.log("test_dec", test_dec);
        console.log("result sig", sig);
        setCallData([
          {
            contractAddress: process.env
              .NEXT_PUBLIC_VERIFIER_POP_CONTRACT as string,
            entrypoint: "write_confirmation",
            calldata: [
              tokenId,
              Date.now(),
              "2507652182239851557039540383923588823803457380",
              hexToDecimal(hexSessionId),
              sig.r,
              sig.s,
            ],
          },
        ]);
      })
      .catch((error) => console.log("error", error));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return isOwner ? (
    address && account && !isVerified ? (
      <>
        {!isOpen ? (
          <Tooltip title={`Start proof of personhood verification`} arrow>
            <div
              className={styles.clickableIconAnima}
              onClick={startVerification}
            >
              <AnimaIcon width={width} color={"white"} />
            </div>
          </Tooltip>
        ) : (
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
                  className="underline"
                >
                  verifier contract
                </a>
                . It will verify the signature is correct and write to you're
                StarknetID your a human.
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
    <Tooltip title={`You're a human verified!`} arrow>
      <div className={styles.clickableIconAnima}>
        <AnimaIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
