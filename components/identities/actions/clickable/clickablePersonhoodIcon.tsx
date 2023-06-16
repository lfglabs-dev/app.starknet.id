import { Tooltip } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../../styles/components/icons.module.css";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";
import "@anima-protocol/personhood-sdk-react/style.css";
import { Personhood } from "@anima-protocol/personhood-sdk-react";
import AnimaIcon from "../../../UI/iconsComponents/icons/animaIcon";
import {
  useAccount,
  useSignTypedData,
  useStarknet,
} from "@starknet-react/core";

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
  const { account } = useAccount();
  const { library } = useStarknet();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [provider, setProvider] = useState<any>();
  const [address, setAddress] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const [payload, setPayload] = useState<any>({});
  const { data, signTypedData } = useSignTypedData(payload);

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
          // setSessionId("bebb9556-b3a2-4248-8c6d-081c55b1ea4a");
        }
      })
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    const provider = (window as any).starknet;
    provider.enable().then(() => {
      setAddress(provider.selectedAddress);
      setProvider(provider);
    });
  }, []);

  const sign = useCallback(
    (payload: string | object) => {
      console.log("payload", payload);
      // return provider.account.signMessage(payload);
      return account?.signMessage(payload as any);
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
    };

    fetch("https://api.pop.anima.io/v1/personhood/init", requestOptions)
      .then((response) => response.json())
      .then((result) => setSessionId(result.session_id))
      .catch((error) => console.log("error", error));
  };

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
          <div className={styles.clickableIconAnima}>
            <AnimaIcon width={width} color={"white"} />
          </div>
        </Tooltip>
      </>
    )
  ) : isVerified ? (
    <Tooltip title={`You're a human!`} arrow>
      <div className={styles.clickableIconAnima}>
        <AnimaIcon width={width} color={"white"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
