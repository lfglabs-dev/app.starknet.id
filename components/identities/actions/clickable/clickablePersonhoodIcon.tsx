import { Modal, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";
import "@anima-protocol/personhood-sdk-react/style.css";
import { Personhood } from "@anima-protocol/personhood-sdk-react";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import AnimaIcon from "../../../UI/iconsComponents/icons/animaIcon";
import ModalMessage from "../../../UI/modalMessage";

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
  const router = useRouter();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [synapseId, setSynapseId] = useState<string | undefined>();

  const [provider, setProvider] = useState<any>();
  const [address, setAddress] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();

  const [isVerified, setIsVerified] = useState<boolean>(false);

  console.log("synapseId", synapseId);

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(tokenId, "personhood")
      .then((response) => {
        console.log("fetched synapseId from contract", response);
        if (response.toString(10) !== "0") {
          setSessionId(response.toString(10));
          setIsVerified(true);
        } else {
          initAnimaSession();
        }
      })
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    const provider = (window as any).starknet;
    console.log("provider", provider);

    provider.enable().then(() => {
      setAddress(provider.selectedAddress);
      setProvider(provider);
    });
  }, []);

  //   import { ec } from "starknet";
  // const userWallet = "0x06ba316C740a79385829293Cf94beb75AA55763d6b8e315163c7B83B32329474"
  // const sessionId = "3f71697b-1516-4dce-968e-cb7ed9f553e7"
  // // Convert session id to hex by adding hex prefix and remove "-" character
  // const hexSessionId = "0x" + sessionId.replace(/-/g, "")
  // const challenge = ec.starkCurve.pedersen(userWallet, hexSessionId);

  const sign = useCallback(
    (payload: string | object) => {
      console.log("payload", payload);
      console.log("signMessage", provider.account.signMessage(payload));
      return provider.account.signMessage(payload);
    },
    [provider]
  );

  const onFinish = useCallback((e: { info: any; state: any }) => {
    console.log("onFinish event: ", e);
  }, []);

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
        // setSessionId(result.session_id)
        let hexSessionId = sessionId as string;
        console.log("hexSessionId", "0x" + hexSessionId.replace(/-/g, ""));
        console.log("result sig", sig);
      })
      .catch((error) => console.log("error", error));
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
      // redirect: "follow",
    };

    fetch("https://api.pop.anima.io/v1/personhood/init", requestOptions)
      .then((response) => response.json())
      .then((result) => setSessionId(result.session_id))
      .catch((error) => console.log("error", error));
  };

  console.log("sessionId", sessionId);

  return isOwner ? (
    address && provider && !isVerified ? (
      <>
        <div>
          <Tooltip title="Start proof of personhood verification" arrow>
            <Personhood
              sessionId={sessionId as string}
              onFinish={onFinish}
              signCallback={sign}
              walletAddress={address}
              starknetChainId={provider.chainId}
              chainType="STARKNET"
            />
          </Tooltip>
        </div>
      </>
    ) : (
      <>
        <Tooltip title={`You're a human!`} arrow>
          <div
            className={styles.clickableIconAnima}
            onClick={() => getSignature()}
          >
            <AnimaIcon width={width} color={"white"} />
          </div>
        </Tooltip>
      </>
    )
  ) : isVerified ? (
    <Tooltip title={`You're a human!`} arrow>
      <div className={styles.clickableIconAnima} onClick={() => getSignature()}>
        <AnimaIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
