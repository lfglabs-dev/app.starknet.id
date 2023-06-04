import React, { FunctionComponent } from "react";
import { getDomainWithoutStark, isSubdomain } from "../../utils/stringService";
import { hexToDecimal } from "../../utils/feltService";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";
import Notification from "../UI/notification";

type IdentityWarningsProps = {
  identity?: Identity;
  isIdentityADomain: boolean;
};

const IdentityWarnings: FunctionComponent<IdentityWarningsProps> = ({
  identity,
  isIdentityADomain,
}) => {
  const { address } = useAccount();
  const currentTimeStamp = new Date().getTime() / 1000;
  const isExpired =
    Number(identity?.domain_expiry) < currentTimeStamp &&
    !isSubdomain(identity?.domain);
  const isDifferentAddress = identity?.addr != hexToDecimal(address);

  return isIdentityADomain ? (
    <>
      <Notification visible={isExpired && Boolean(address)} severity="error">
        <>
          This domain has expired you can buy it on the&nbsp;
          <span className="underline">
            <Link
              href={"/search?domain=" + getDomainWithoutStark(identity?.domain)}
            >
              domain page
            </Link>
          </span>
        </>
      </Notification>
      <Notification
        visible={isDifferentAddress && Boolean(address)}
        severity="error"
      >
        <>&nbsp;Be careful this domain is not linked to your current address.</>
      </Notification>
    </>
  ) : null;
};

export default IdentityWarnings;
