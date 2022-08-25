import { FunctionComponent, useEffect, useState } from "react";
import DiscordIcon from "../UI/icons/discordIcon";
import TwitterIcon from "../UI/icons/twitterIcon";
import GithubIcon from "../UI/icons/githubIcon";
import { useNamingContract } from "../../hooks/contracts";
import { useStarknetCall } from "@starknet-react/core";
import { stringToFelt } from "../../utils/felt";
import Link from "next/link";
import { useAddressFromDomain } from "../../hooks/naming";

type DetailsProps = {
  domain: string;
  isAvailable: boolean;
};

const Details: FunctionComponent<DetailsProps> = ({ domain, isAvailable }) => {
  const [ownerAddress, setOwnerAddress] = useState<string | undefined>(
    undefined
  );
  const [tokenId, setTokenId] = useState<number | undefined>(undefined);

  const { contract } = useNamingContract();
  const { address: domainData, error: domainError } = useAddressFromDomain([
    domain,
  ]);

  const { data: tokenIdData, error: tokenIdError } = useStarknetCall({
    contract: contract,
    method: "domain_to_token_id",
    args: [[stringToFelt(domain)]],
  });

  useEffect(() => {
    if (domainError || tokenIdError) {
      return;
    } else {
      if (tokenIdData || domainData) {
        setTokenId(tokenIdData?.["token_id"] as any);
        setOwnerAddress(domainData?.["address"] as any);
      }
    }
  }, [domainData, domainError, tokenIdData, tokenIdError]);

  if (isAvailable)
    return (
      <div className="flex justify-center align-center mt-2">
        <p>There is no data attached to this domain</p>
      </div>
    );

  if (domainError || tokenIdError)
    return (
      <div className="flex justify-center align-center mt-2">
        <p>Unable to view data</p>
      </div>
    );

  return (
    <div className="sm:w-2/3 w-4/5 break-all">
      <p>
        <strong>Owner :</strong>&nbsp;
        {ownerAddress}
      </p>
      <p>
        <strong>Starknet.id owner :</strong>&nbsp;
        <Link className="underline" href={`/identities/${tokenId}`}>
          {tokenId}
        </Link>
      </p>
      <div className="flex justify-center align-center mt-2">
        <div className="m-2">
          <DiscordIcon color="#19aa6e" width={"25"} />
        </div>
        <div className="m-2">
          <TwitterIcon color="#19aa6e" width={"25"} />
        </div>
        <div className="m-2">
          <GithubIcon color="#19aa6e" width={"25"} />
        </div>
      </div>
    </div>
  );
};

export default Details;
