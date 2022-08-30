import React, { FunctionComponent } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useStarknetCall } from "@starknet-react/core";
import {
  useStarknetIdContract,
  verifierContract,
} from "../../../hooks/contracts";
import { stringToFelt } from "../../../utils/felt";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import VerifiedIcon from "./verifiedIcon";
import UnverifiedIcon from "./unverifiedIcon";

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
    args: [[router.query.tokenId, 0], stringToFelt(type), verifierContract],
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
  ) : (
    <div className="absolute bottom-0 right-1">
      <UnverifiedIcon color="#19AA6E" width={width} />
    </div>
  );
};

export default Verified;
