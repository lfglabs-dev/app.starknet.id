import { FunctionComponent, useEffect, useState } from "react";
import Link from "next/link";
import {
  useAddressFromDomain,
  useExpiryFromDomain,
  useTokenIdFromDomain,
} from "../../hooks/naming";
import { ThreeDots } from "react-loader-spinner";
import styles from "../../styles/home.module.css";

type DetailsProps = {
  domain: string;
  isAvailable?: boolean;
};

const Details: FunctionComponent<DetailsProps> = ({ domain, isAvailable }) => {
  const [ownerAddress, setOwnerAddress] = useState<string | undefined>(
    undefined
  );
  const [tokenId, setTokenId] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const { address: domainData, error: domainError } =
    useAddressFromDomain(domain);

  const { tokenId: tokenIdData, error: tokenIdError } =
    useTokenIdFromDomain(domain);

  const { expiry: expiryData, error: expiryError } =
    useExpiryFromDomain(domain);

  useEffect(() => {
    if (domainError) {
      return;
    } else {
      if (domainData) {
        setOwnerAddress(domainData?.["address"].toString(16) as string);
      }
    }
  }, [domainData, domainError]);

  useEffect(() => {
    if (tokenIdError) {
      return;
    } else {
      if (tokenIdData) {
        setTokenId(tokenIdData?.["owner"]);
      }
    }
  }, [tokenIdData, tokenIdError]);

  useEffect(() => {
    if (expiryError) {
      return;
    } else {
      if (expiryData) {
        setExpiryDate(new Date(expiryData?.["expiry"].toNumber() * 1000));
      }
    }
  }, [expiryData, expiryError]);

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
      {ownerAddress && (
        <p>
          <strong>Points to :</strong>&nbsp;
          <span>{"0x" + ownerAddress}</span>
        </p>
      )}
      {expiryDate && (
        <p>
          <strong>Expiration date :</strong>&nbsp;
          <span>{expiryDate.toDateString()}</span>
        </p>
      )}
      {(!ownerAddress || !tokenId || !expiryDate) && (
        <ThreeDots
          wrapperClass="flex justify-center"
          height="25"
          width="80"
          radius="9"
          color="#19AA6E"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      )}
      {tokenId && (
        <Link href={`/identities/${tokenId}`}>
          <div className={styles.cardCenter}>
            <p className="text">See owner identity</p>
          </div>
        </Link>
      )}
      {/* <div className="flex justify-center align-center mt-2">
        <div className="m-2">
          <DiscordIcon color="#19aa6e" width={"25"} />
        </div>
        <div className="m-2">
          <TwitterIcon color="#19aa6e" width={"25"} />
        </div>
        <div className="m-2">
          <GithubIcon color="#19aa6e" width={"25"} />
        </div>
      </div> */}
    </div>
  );
};

export default Details;
