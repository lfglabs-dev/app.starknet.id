import React from "react";
import { Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { FunctionComponent, useEffect, useState } from "react";
import ClickableIcon from "../UI/iconsComponents/clickableIcon";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import { useEncodedSeveral } from "../../hooks/naming";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import ChangeAddressModal from "./actions/changeAddressModal";
import { getDomainWithoutStark } from "../../utils/stringService";
import TransferFormModal from "./actions/transferFormModal";
import SubdomainModal from "./actions/subdomainModal";
import RenewalModal from "./actions/renewalModal";
import SocialMediaActions from "./actions/socialmediaActions";
import { Identity } from "../../types/backTypes";
import { hexToDecimal } from "../../utils/feltService";
import IdentitiesActionsSkeleton from "../UI/identitiesActionsSkeleton";

type IdentityActionsProps = {
  identity?: Identity;
  tokenId: string;
  isIdentityADomain: boolean;
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
  isIdentityADomain,
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [isRenewFormOpen, setIsRenewFormOpen] = useState<boolean>(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const [isSubdomainFormOpen, setIsSubdomainFormOpen] =
    useState<boolean>(false);
  const { address } = useAccount();
  const encodedDomains = useEncodedSeveral(
    getDomainWithoutStark(identity ? identity.domain : "").split(".") ?? []
  );
  const isAccountTargetAddress = identity?.addr === hexToDecimal(address);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)

  // Add all subdomains to the parameters
  const callDataEncodedDomain: (number | string)[] = [encodedDomains.length];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain);
  });

  //Set as main domain execute
  const set_address_to_domain_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: callDataEncodedDomain,
  };
  const set_domain_to_address_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_domain_to_address",
    calldata: [...callDataEncodedDomain, hexToDecimal(address)],
  };
  const { execute: set_address_to_domain } = useStarknetExecute({
    calls: isAccountTargetAddress
      ? set_address_to_domain_calls
      : [set_domain_to_address_calls, set_address_to_domain_calls],
  });
  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  useEffect(() => {
    type fullIds = { id: string; domain: string };

    function checkIfOwner(fullIds: fullIds[]): boolean {
      let isOwner = false;

      for (let i = 0; i < fullIds.length; i++) {
        if (fullIds[i].id === tokenId) {
          isOwner = true;
        }
      }

      return isOwner;
    }

    if (address && tokenId) {
    setLoading(true)
      // Our Indexer
      fetch(`/api/indexer/addr_to_full_ids?addr=${hexToDecimal(address)}`)
        .then((response) => response.json())
        .then((data) => {
          setIsOwner(checkIfOwner(data.full_ids));
          setLoading(false)
        });
      }
  }, [address, tokenId]);

  return (
    <>
    {!loading ? <IdentitiesActionsSkeleton/> :
    <>
      <>
        <SocialMediaActions
          domain={identity?.domain}
          isOwner={isOwner}
          tokenId={tokenId}
        />
        <Divider
          light={true}
          component="div"
          style={{
            width: "3rem",
            height: "0.2rem",
            marginBottom: "0.25rem",
            marginTop: "0.25rem",
          }}
        ></Divider>
      </>
      <div className="flex">
        {identity && !isOwner && isIdentityADomain && (
          <>
            <div className="m-2">
              <ClickableIcon
                title="View on Mintsquare"
                icon="mintsquare"
                onClick={() =>
                  window.open(
                    `https://mintsquare.io/asset/starknet/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                  )
                }
              />
            </div>
            <div className="m-2">
              <ClickableIcon
                title="View on Aspect"
                icon="aspect"
                onClick={() =>
                  window.open(
                    `https://aspect.co/asset/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                  )
                }
              />
            </div>
          </>
        )}

        {identity && isOwner && (
          <>
            {callDataEncodedDomain[0] === 1 ? (
              <div className="m-2">
                <ClickableIcon
                  title="Renew domain"
                  icon="change"
                  onClick={() => setIsRenewFormOpen(true)}
                />
              </div>
            ) : null}
            <div className="m-2">
              <ClickableIcon
                title="Change target address"
                icon="address"
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
            {!identity.is_owner_main ? (
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

      <RenewalModal
        handleClose={() => setIsRenewFormOpen(false)}
        isModalOpen={isRenewFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        identity={identity}
      />
      <ChangeAddressModal
        handleClose={() => setIsAddressFormOpen(false)}
        isModalOpen={isAddressFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.domain}
        currentTargetAddress={identity?.addr}
      />
      <TransferFormModal
        handleClose={() => setIsTransferFormOpen(false)}
        isModalOpen={isTransferFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.domain}
      />
      <SubdomainModal
        handleClose={() => setIsSubdomainFormOpen(false)}
        isModalOpen={isSubdomainFormOpen}
        callDataEncodedDomain={callDataEncodedDomain}
        domain={identity?.domain}
      />
    </>
    }
</>
  );
};

export default IdentityActions;
