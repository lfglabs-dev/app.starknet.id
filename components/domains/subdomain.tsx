import { FunctionComponent, useEffect, useState } from "react";
import { useTokenIdFromDomain } from "../../hooks/naming";
import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
} from "@starknet-react/core";
import {
  useNamingContract,
  useStarknetIdContract,
} from "../../hooks/contracts";
import Button from "../UI/button";
import { TextField } from "@mui/material";
("");
type SubdomainProps = {
  domain: string;
};

const Subdomain: FunctionComponent<SubdomainProps> = ({ domain }) => {
  const { account } = useStarknet();
  const [tokenId, setTokenId] = useState<number | undefined>(undefined);
  const [subdomain, setSubdomain] = useState<string | undefined>(undefined);
  const [isOwnerOf, setIsOwnerOf] = useState<boolean>(false);
  const { tokenId: tokenIdData, error: tokenIdError } =
    useTokenIdFromDomain(domain);
  const { contract: starknetIdContract } = useStarknetIdContract();
  const { contract: namingContract } = useNamingContract();
  const { data, error } = useStarknetCall({
    contract: starknetIdContract,
    method: "ownerOf",
    args: [[tokenId, 0]],
  });
  const {
    data: transferData,
    invoke,
    error: transferError,
  } = useStarknetInvoke({
    contract: namingContract,
    method: "transfer_domain",
  });

  useEffect(() => {
    if (error || tokenIdError) {
      return;
    }
    if (tokenId && data && account) {
      setIsOwnerOf(
        data?.["owner"].toString(16) === account.substr(2, account.length - 1)
      );
    }
  }, [tokenId, data, account]);

  useEffect(() => {
    if (tokenIdError) {
      return;
    } else {
      if (tokenIdData) {
        setTokenId(tokenIdData?.["owner"].low.toNumber());
      }
    }
  }, [tokenIdData, tokenIdError]);

  // useEffect(() => {
  //   if (account) {

  //     return;
  //   }
  // }, [account]);

  function changeSubdomain(e: any): void {
    setSubdomain(e.target.value);
  }

  function renew(domain: string) {
    invoke({
      args: [[domain, [tokenId, 0]]],
    });
  }

  return (
    <div className="flex justify-center align-center mt-2">
      {isOwnerOf ? (
        <div className="flex flex-col">
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
          <div className="mt-2">
            <Button
              disabled={!subdomain}
              onClick={() => renew(subdomain ?? "")}
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
