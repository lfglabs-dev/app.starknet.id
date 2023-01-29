import React, { FunctionComponent } from "react";
import { Identity } from "../../types/backTypes";
import { getDomainWithoutStark, isSubdomain } from "../../utils/stringService";
import Link from "next/link";

type IdentityWarningsProps = {
  identity?: Identity;
};

const IdentityWarnings: FunctionComponent<IdentityWarningsProps> = ({
  identity,
}) => {
  const currentTimeStamp = new Date().getTime() / 1000;

  return (
    <>
      {Number(identity?.domain_expiry) < currentTimeStamp &&
      !isSubdomain(identity?.domain ?? "") ? (
        <strong className="mt-2 text-red-600 text-center">
          (This domain has expired you can buy it on the&nbsp;
          <span className="underline">
            <Link
              href={
                "/search?domain=" +
                getDomainWithoutStark(identity?.domain ?? "")
              }
            >
              domain page
            </Link>
          </span>
          )
        </strong>
      ) : null}
    </>
  );
};

export default IdentityWarnings;
