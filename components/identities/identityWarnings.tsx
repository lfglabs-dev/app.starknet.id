import React, { FunctionComponent, useEffect, useState } from "react";
import { Identity } from "../../types/backTypes";
import { getDomainWithoutStark, isSubdomain } from "../../utils/stringService";
import { Alert, Snackbar } from "@mui/material";
import { hexToDecimal } from "../../utils/feltService";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";

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
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if ((isExpired || isDifferentAddress) && address) {
      setShowWarning(true);
    }
  }, [isDifferentAddress, isExpired, address]);

  return isIdentityADomain ? (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={showWarning}
    >
      <Alert severity="error" onClose={() => setShowWarning(false)}>
        {isExpired && (
          <>
            This domain has expired you can buy it on the&nbsp;
            <span className="underline">
              <Link
                href={
                  "/search?domain=" + getDomainWithoutStark(identity?.domain)
                }
              >
                domain page
              </Link>
            </span>
          </>
        )}
        {isDifferentAddress && (
          <>
            &nbsp;Be careful this domain is not linked to your current address.
          </>
        )}
      </Alert>
    </Snackbar>
  ) : null;
};

export default IdentityWarnings;
