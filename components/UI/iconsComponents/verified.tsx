import React, { FunctionComponent } from "react";
import { useStarknetCall } from "@starknet-react/core";
import { useStarknetIdContract } from "../../../hooks/contracts";
import { stringToFelt } from "../../../utils/felt";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import VerifiedIcon from "./icons/verifiedIcon";

type VerifiedProps = {
  type: string;
  width: string;
};

const Verified: FunctionComponent<VerifiedProps> = ({ type, width }) => {
  const router = useRouter();
  const { contract } = useStarknetIdContract();
  const { data, error } = useStarknetCall({
    contract: contract,
    method: "get_verifier_data",
    args: [
      router.query.tokenId,
      stringToFelt(type),
      process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
    ],
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (error || !data || Number(data) === 0) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [data, error]);

  return !data ? (
    <div />
  ) : isValid ? (
    <div className="absolute bottom-0 right-1">
      <VerifiedIcon color="#19AA6E" width={width} />
    </div>
  ) : null;
};

export default Verified;
