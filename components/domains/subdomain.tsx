import { FunctionComponent, useEffect, useState } from "react";
import { useEncoded, useTokenIdFromDomain } from "../../hooks/naming";
import {
  useAccount,
  useStarknetCall,
  useStarknetInvoke,
} from "@starknet-react/core";
import {
  useNamingContract,
  useStarknetIdContract,
} from "../../hooks/contracts";
import Button from "../UI/button";
import { TextField } from "@mui/material";

type SubdomainProps = {
  domain: string;
};

const Subdomain: FunctionComponent<SubdomainProps> = ({ domain }) => {
  const { account } = useAccount();
  const [tokenId, setTokenId] = useState<number | undefined>();
  const [targetTokenId, setTargetTokenId] = useState<number>();
  const [subdomain, setSubdomain] = useState<string>("");
  const encodedRootDomain = useEncoded(domain);
  const encodedSubdomain = useEncoded(subdomain);
  const [isOwnerOf, setIsOwnerOf] = useState<boolean>(false);
  const { tokenId: tokenIdData, error: tokenIdError } =
    useTokenIdFromDomain(domain);
  const { contract: starknetIdContract } = useStarknetIdContract();
  const { contract: namingContract } = useNamingContract();
  const { data, error } = useStarknetCall({
    contract: starknetIdContract,
    method: "ownerOf",
    args: [[tokenId, 0], ""],
  });
  const { invoke, error: invokeError } = useStarknetInvoke({
    contract: namingContract,
    method: "transfer_domain",
  });

  useEffect(() => {
    if (error || tokenIdError) {
      return;
    }
    if (tokenId && data && account) {
      setIsOwnerOf(
        data?.["owner"].toString(16) ===
          account.address.substr(2, account.address.length - 1)
      );
    }
  }, [tokenId, data, account]);

  useEffect(() => {
    if (tokenIdError) {
      return;
    } else {
      if (tokenIdData) {
        setTokenId(tokenIdData?.["owner"]);
      }
    }
  }, [tokenIdData, tokenIdError]);

  function changeSubdomain(e: any): void {
    setSubdomain(e.target.value);
  }

  function createSubdomain() {
    invoke({
      args: [
        [encodedSubdomain.toString(), encodedRootDomain.toString()],
        targetTokenId,
      ],
    });
  }

  function changeTargetTokenId(e: any): void {
    setTargetTokenId(e.target.value);
  }

  return (
    <div className="flex justify-center align-center m-2">
      {isOwnerOf ? (
        <div className="flex flex-col">
          <div className="flex">
            <div className="mr-1 z-[0] w-1/2">
              <TextField
                fullWidth
                id="outlined-basic"
                label="Subdomain"
                placeholder="Subdomain"
                variant="outlined"
                onChange={changeSubdomain}
                color="secondary"
                required
              />
            </div>
            <div className="ml-1 z-[0] w-1/2">
              <TextField
                fullWidth
                className="ml-1 z-[0]"
                id="outlined-basic"
                label="Target starknet.id"
                type="number"
                placeholder="token id"
                variant="outlined"
                onChange={changeTargetTokenId}
                InputProps={{
                  inputProps: { min: 1 },
                }}
                defaultValue={targetTokenId}
                color="secondary"
                required
              />
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <Button
              disabled={!subdomain || !targetTokenId}
              onClick={() => createSubdomain()}
            >
              Register
            </Button>
          </div>
        </div>
      ) : (
        <p>
          We can not see subdomains for the moment on this testnet version (but
          you can register it).
        </p>
      )}
    </div>
  );
};

export default Subdomain;
