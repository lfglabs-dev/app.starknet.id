import { Tooltip } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Identity } from "../../pages/identities/[tokenId]";
import ClickableIcon from "../UI/iconsComponents/clickableIcon";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import { useDomainFromAddress, useEncodedSeveral } from "../../hooks/naming";
import { BN } from "bn.js";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { namingContract, useStarknetIdContract } from "../../hooks/contracts";
import ChangeAddressModal from "./actions/changeAddressModal";
import {
  isStarkDomain,
  removeStarkFromString,
} from "../../utils/stringService";
import TransferFormModal from "./actions/transferFormModal";
import SubdomainModal from "./actions/subdomainModal";

type IdentityActionsProps = {
  identity?: Identity;
  tokenId: string;
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const [isSubdomainFormOpen, setIsSubdomainFormOpen] =
    useState<boolean>(false);
  const { address } = useAccount();
  const { domain: domainFromAddress } = useDomainFromAddress(
    new BN((address ?? "").slice(2), 16).toString(10)
  );
  const encodedDomains = useEncodedSeveral(
    removeStarkFromString(identity ? identity.name : "").split(".") ?? []
  );
  const [targetAddress, setTargetAddress] = useState<string | undefined>();
  const [isAccountTargetAddress, setIsAccountTargetAddress] =
    useState<boolean>(false);
  const isMainDomain = domainFromAddress != identity?.name;

  //Check if connected account is owner
  const { contract: starknetIdContract } = useStarknetIdContract();

  // Add all subdomains to the parameters
  const callDataEncodedDomain: (number | string)[] = [encodedDomains.length];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain);
  });

  //Set as main domain execute
  const set_address_to_domain_calls = {
    contractAddress: namingContract,
    entrypoint: "set_address_to_domain",
    calldata: callDataEncodedDomain,
  };
  const set_domain_to_address_calls = {
    contractAddress: namingContract,
    entrypoint: "set_domain_to_address",
    calldata: [
      ...callDataEncodedDomain,
      new BN((address ?? "").slice(2), 16).toString(10),
    ],
  };
  const { execute: set_address_to_domain } = useStarknetExecute({
    calls: isAccountTargetAddress
      ? set_address_to_domain_calls
      : [set_domain_to_address_calls, set_address_to_domain_calls],
  });

  //Get redirection address

  useEffect(() => {
    if (identity && isStarkDomain(identity.name) && address) {
      fetch(
        `https://goerli2.indexer.starknet.id/domain_to_addr?domain=${identity.name}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setIsAccountTargetAddress(false);
          }
          setTargetAddress(data.addr);
        });
    }
  }, [identity, address]);

  // function startVerification(link: string): void {
  //   sessionStorage.setItem("tokenId", tokenId);
  //   router.push(link);
  // }

  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  return (
    <>
      <div className="flex">
        {/* <div className="m-2">
          <ClickableIcon
            title="Start verifying twitter"
            icon="twitter"
            onClick={() =>
              startVerification(
                "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=Rkp6QlJxQzUzbTZtRVljY2paS0k6MTpjaQ&redirect_uri=https://goerli.app.starknet.id/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain"
              )
            }
          />
        </div>
        <div className="m-2">
          <ClickableIcon
            title="Start verifying discord"
            icon="discord"
            onClick={() =>
              startVerification(
                "https://discord.com/oauth2/authorize?client_id=991638947451129886&redirect_uri=https%3A%2F%2Fgoerli.app.starknet.id%2Fdiscord&response_type=code&scope=identify"
              )
            }
          />
        </div>
        <div className="m-2">
          <ClickableIcon
            title="Start verifying github"
            icon="github"
            onClick={() =>
              startVerification(
                "https://github.com/login/oauth/authorize?client_id=bd72ec641d75c2608121"
              )
            }
          />
        </div> */}

        {identity && isStarkDomain(identity.name) && (
          <>
            <div className="m-2">
              <ClickableIcon
                title="View on Mintsquare"
                icon="mintsquare"
                onClick={() =>
                  window.open(
                    `https://mintsquare.io/asset/starknet-testnet/${starknetIdContract}/${tokenId}`
                  )
                }
              />
            </div>
            <div className="m-2">
              <ClickableIcon
                title="Change redirection address"
                icon="change"
                onClick={() => setIsAddressFormOpen(true)}
              />
            </div>
            <div className="m-2">
              <ClickableIcon
                title="Transfer domain"
                icon="transfer"
                onClick={() => setIsTransferFormOpen(true)}
              />
            </div>
            <div className="m-2">
              <ClickableIcon
                title="Create subdomain"
                icon="plus"
                onClick={() => setIsSubdomainFormOpen(true)}
              />
            </div>
            {isMainDomain ? (
              <div className="m-2">
                <ClickableIcon
                  title="Set this domain as your main domain"
                  icon="main"
                  onClick={() => setAddressToDomain()}
                />
              </div>
            ) : (
              <div className="m-2">
                <>
                  <Tooltip
                    title="This domain is already your main domain"
                    arrow
                  >
                    <div>
                      <MainIcon
                        width="40"
                        firstColor="#19aa6e"
                        secondColor="#19aa6e"
                      />
                    </div>
                  </Tooltip>
                </>
              </div>
            )}
          </>
        )}
      </div>
      <ChangeAddressModal
        handleClose={() => setIsAddressFormOpen(false)}
        isModalOpen={isAddressFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.name}
        currentTargetAddress={targetAddress}
      />
      <TransferFormModal
        handleClose={() => setIsTransferFormOpen(false)}
        isModalOpen={isTransferFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.name}
      />
      <SubdomainModal
        handleClose={() => setIsSubdomainFormOpen(false)}
        isModalOpen={isSubdomainFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.name}
      />
    </>
  );
};

export default IdentityActions;
