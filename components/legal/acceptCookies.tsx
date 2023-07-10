import React, { FunctionComponent, useEffect, useState } from "react";
import Notification from "../UI/notification";
import { useRouter } from "next/router";

type AcceptCookiesProps = {
  message: string;
};

const AcceptCookies: FunctionComponent<AcceptCookiesProps> = ({ message }) => {
  const [cookiesAccepted, setCookiesAccepted] = useState(true);
  const router = useRouter();
  const sponsor = router.query.referee as string;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCookiesAccepted(localStorage.getItem("cookiesAccepted") === "true");
  }, []);

  useEffect(() => {
    if (sponsor) {
      const referralData = {
        sponsor: sponsor, // the sponsor address
        expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // the current date of expiration + 1 week
      };

      localStorage.setItem("referralData", JSON.stringify(referralData));
    }
  }, [sponsor]);

  return (
    <Notification visible={!cookiesAccepted} severity="info">
      <div className="flex flex-wrap sm:gap-20 gap-5">
        <p>{message}</p>
        <div className="flex">
          <>
            <a
              className="hover:underline"
              href="https://www.starknet.id/pdfs/PrivacyPolicy.pdf"
              target="blank"
            >
              Privacy Policy
            </a>
          </>

          <strong
            className="ml-3 mr-1 cursor-pointer"
            onClick={() => {
              setCookiesAccepted(true);
              localStorage.setItem("cookiesAccepted", "true");
            }}
          >
            OK
          </strong>
        </div>
      </div>
    </Notification>
  );
};

export default AcceptCookies;
