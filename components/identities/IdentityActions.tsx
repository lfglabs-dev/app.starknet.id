import { Tooltip } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { Identity } from "../../pages/identities/[tokenId]";
import ClickableIcon from "../UI/iconsComponents/clickableIcon";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import { useDomainFromAddress, useEncodedSeveral } from "../../hooks/naming";
import { BN } from "bn.js";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { starknetIdContract, namingContract } from "../../hooks/contracts";
import ChangeAddressModal from "./actions/changeAddressModal";
import { removeStarkFromString } from "../../utils/stringService";
import TransferFormModal from "./actions/transferFormModal";

type IdentityActionsProps = {
  identity?: Identity;
  tokenId: string;
  domain?: string;
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
  domain,
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const { account } = useAccount();
  const { domain: domainFromAddress } = useDomainFromAddress(
    new BN((account?.address ?? "").slice(2), 16).toString(10)
  );
  const encodedDomains = useEncodedSeveral(
    removeStarkFromString(identity ? identity.name : "").split(".") ?? []
  );

  const isMainDomain =
    identity &&
    identity.name.includes(".stark") &&
    domainFromAddress != identity.name;

  // Add all subdomains to the parameters
  const callDataEncodedDomain: (number | string)[] = [encodedDomains.length];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain);
  });

  //set_address_to_domain execute
  const set_address_to_domain_calls = {
    contractAddress: namingContract,
    entrypoint: "set_address_to_domain",
    calldata: callDataEncodedDomain,
  };
  const { execute: set_address_to_domain } = useStarknetExecute({
    calls: set_address_to_domain_calls,
  });

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

        {domain && (
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
          </>
        )}
        {identity && identity.name.includes(".stark") ? (
          isMainDomain ? (
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
                <Tooltip title="This domain is already your main domain" arrow>
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
          )
        ) : null}
      </div>
      <ChangeAddressModal
        handleClose={() => setIsAddressFormOpen(false)}
        isAddressFormOpen={isAddressFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={domain}
      />
      <TransferFormModal
        handleClose={() => setIsTransferFormOpen(false)}
        isTransferFormOpen={isTransferFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={domain}
      />
    </>
  );
};

export default IdentityActions;
