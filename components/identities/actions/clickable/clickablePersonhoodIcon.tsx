import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import GithubIcon from "../../../UI/iconsComponents/icons/githubIcon";
import styles from "../../../../styles/components/icons.module.css";
import { minifyDomain } from "../../../../utils/stringService";
import VerifiedIcon from "../../../UI/iconsComponents/icons/verifiedIcon";
import { StarknetIdJsContext } from "../../../../context/StarknetIdJsProvider";
import "@anima-protocol/personhood-sdk-react/style.css";
import { Personhood } from "@anima-protocol/personhood-sdk-react";
import { useStarknet } from "@starknet-react/core";
import { Provider, ProviderInterface } from "starknet";

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
  const [synapseId, setSynapseId] = useState<string | undefined>();
  const [githubUsername, setGithubUsername] = useState<string | undefined>();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  const [provider, setProvider] = useState<any>();
  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => {
    starknetIdNavigator
      ?.getVerifierData(tokenId, "personhood")
      .then((response) => {
        if (response.toString(10) !== "0") {
          setSynapseId(response.toString(10));
        }
      })
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    // @ts-ignore
    const provider = window.starknet;
    console.log("provider", provider);

    provider.enable().then(() => {
      setAddress(provider.selectedAddress);
      setProvider(provider);
    });
  }, []);

  // useEffect(() => {
  //   if (synapseId) {
  //     fetch(`https://api.github.com/user/${synapseId}`)
  //       .then((response) => response.json())
  //       // TO DO : Find how to import the github response type
  //       .then((data) => {
  //         setGithubUsername(data.login);
  //       });
  //   }
  // }, [synapseId]);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  const sign = useCallback(
    (payload: string | object) => provider.account.signMessage(payload),
    [provider]
  );

  const shared = useCallback((e: { info: string }) => {
    console.log("shared", e.info);
  }, []);

  return isOwner ? (
    address && provider ? (
      <Personhood
        sessionId="01234567-8901-2345-6789-012345678901"
        onFinish={shared}
        signCallback={sign}
        walletAddress={address}
        starknetChainId={provider.chainId}
        chainType="STARKNET"
      />
    ) : (
      <></>
    )
  ) : githubUsername ? (
    <Tooltip title={`Check ${minifyDomain(domain)} github`} arrow>
      <div
        className={styles.clickableIconGithub}
        onClick={() => window.open(`https://github.com/${githubUsername}`)}
      >
        <GithubIcon width={width} color="white" />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickablePersonhoodIcon;
