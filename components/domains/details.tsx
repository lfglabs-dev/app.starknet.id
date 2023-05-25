import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import {
  useAddressFromDomain,
  useExpiryFromDomain,
  useTokenIdFromDomain,
} from "../../hooks/naming";
import { ThreeDots } from "react-loader-spinner";
import styles from "../../styles/Home.module.css";
import { minifyAddress } from "../../utils/stringService";

type DetailsProps = {
  domain: string;
};

const Details: FunctionComponent<DetailsProps> = ({ domain }) => {
  const [ownerAddress, setOwnerAddress] = useState<string | undefined>(
    undefined
  );
  const [tokenId, setTokenId] = useState<number>(0);
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
        setOwnerAddress(domainData);
      }
    }
  }, [domainData, domainError]);

  useEffect(() => {
    if (tokenIdError) {
      return;
    } else {
      if (tokenIdData) {
        setTokenId(tokenIdData);
      } else {
        setTokenId(0);
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

  if (ownerAddress === "0")
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
    <div className="w-full break-all">
      {!ownerAddress || !expiryDate ? (
        <ThreeDots
          wrapperClass="flex justify-center"
          height="25"
          width="80"
          radius="9"
          color="#19AA6E"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      ) : !tokenId ? (
        <p>This domain is not registered</p>
      ) : (
        <>
          {ownerAddress && (
            <p>
              <strong>Points to :</strong>&nbsp;
              <span>
                {ownerAddress === "0x0"
                  ? ownerAddress
                  : minifyAddress(ownerAddress)}
              </span>
            </p>
          )}
          {expiryDate && (
            <p>
              <strong>Expiration date :</strong>&nbsp;
              <span>{expiryDate.toDateString()}</span>
            </p>
          )}
          {tokenId && (
            <div
              onClick={() =>
                window.open(`https://www.starknet.id/${domain}.stark`)
              }
              className={styles.cardCenter}
            >
              <p className="text">See owner identity</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Details;
