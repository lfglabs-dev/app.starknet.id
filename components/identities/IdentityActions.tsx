import { Modal, TextField, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import { Identity } from "../../pages/identities/[tokenId]";
import ClickableIcon from "../UI/iconsComponents/clickableIcon";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import styles3 from "../../styles/components/wallets.module.css";
import {
  useAddressFromDomain,
  useDomainFromAddress,
  useEncoded,
} from "../../hooks/naming";
import { BN } from "bn.js";
import { useStarknet, useStarknetInvoke } from "@starknet-react/core";
import { isHexString } from "../../hooks/string";
import { useNamingContract, starknetIdContract } from "../../hooks/contracts";
import Button from "../UI/button";

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
  const router = useRouter();
  const [isAddressFormOpen, setOpenAddressForm] = useState<boolean>(false);
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string | undefined>();
  const handleOpen = () => setOpenAddressForm(true);
  const handleClose = () => setOpenAddressForm(false);
  const { account } = useStarknet();
  const { domain: domainFromAddress } = useDomainFromAddress(
    new BN((account ?? "").slice(2), 16).toString(10)
  );
  const encodedDomain = useEncoded(
    (identity?.name.replace(".stark", "") as string) ?? ""
  );
  const { address: domainData, error: domainError } = useAddressFromDomain(
    domain ?? ""
  );
  const { contract } = useNamingContract();
  const { invoke: set_address_to_domain } = useStarknetInvoke({
    contract: contract,
    method: "set_address_to_domain",
  });
  const { invoke: set_domain_to_address, error } = useStarknetInvoke({
    contract: contract,
    method: "set_domain_to_address",
  });

  const isMainDomain =
    identity &&
    identity.name.includes(".stark") &&
    domainFromAddress != identity.name;

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  useEffect(() => {
    if (account) {
      setTargetAddress(account);
    }
  }, [account]);

  function changeAddress(e: any): void {
    isHexString(e.target.value) ? setTargetAddress(e.target.value) : null;
  }

  useEffect(() => {
    if (domainError) {
      return;
    } else {
      if (domainData) {
        setOwnerAddress(domainData?.["address"].toString(16) as string);
      }
    }
  }, [domainData, domainError]);

  function setAddressToDomain(): void {
    set_address_to_domain({
      args: [[encodedDomain.toString(10)]],
    });
  }

  function setDomainToAddress(): void {
    set_domain_to_address({
      args: [
        [encodedDomain.toString(10)],
        new BN(targetAddress?.slice(2), 16).toString(10),
      ],
    });
  }

  return (
    <>
      <div className="flex">
        <div className="m-2">
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
        </div>
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
        {domain && (
          <div className="m-2">
            <ClickableIcon
              title="Change redirection address"
              icon="change"
              onClick={handleOpen}
            />
          </div>
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
      <Modal
        disableAutoFocus
        open={isAddressFormOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles3.menu}>
          <button className={styles3.menu_close} onClick={handleClose}>
            <svg viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <p className={styles3.menu_title}>Change the redirection address</p>
          <div className="mt-5 flex flex-col justify-center">
            {ownerAddress && (
              <p className="break-all">
                <strong>Current Address :</strong>&nbsp;
                <span>{"0x" + ownerAddress}</span>
              </p>
            )}
            <div className="mt-5">
              <TextField
                fullWidth
                label="new target address"
                id="outlined-basic"
                value={targetAddress ?? "0x.."}
                variant="outlined"
                onChange={changeAddress}
                color="secondary"
                required
              />
            </div>
            <div className="mt-5">
              <Button
                disabled={!targetAddress}
                onClick={() => setDomainToAddress()}
              >
                Set new address
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default IdentityActions;
