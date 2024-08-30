import { useEffect, useMemo, useState } from "react";
import { useDomainFromAddress } from "../naming";
import { FormType } from "@/utils/constants";

export const useCheckoutState = (type: FormType, address?: string) => {
  const [termsBox, setTermsBox] = useState<boolean>(false);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [mainDomainBox, setMainDomainBox] = useState<boolean>(true);
  const [hasUserSelectedOffer, setHasUserSelectedOffer] =
    useState<boolean>(false);
  const [hasReverseAddressRecord, setHasReverseAddressRecord] =
    useState<boolean>(false);
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const [reducedDuration, setReducedDuration] = useState<number>(0);
  const [nonSubscribedDomains, setNonSubscribedDomains] = useState<string[]>();
  const [sponsor, setSponsor] = useState<string>("0x0");
  const mainDomain = useDomainFromAddress(address ?? "");

  const hasMainDomain = useMemo(() => {
    if (!mainDomain || !mainDomain.domain) return false;
    return mainDomain.domain.endsWith(".stark");
  }, [mainDomain]);

  useEffect(() => {
    const referralData = localStorage.getItem("referralData");
    if (referralData) {
      const data = JSON.parse(referralData);
      if (data.sponsor && data?.expiry >= new Date().getTime()) {
        setSponsor(data.sponsor);
      } else {
        setSponsor("0");
      }
    } else {
      setSponsor("0");
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/addr_has_rev?addr=${address}`)
      .then((response) => response.json())
      .then((reverseAddressData) => {
        setHasReverseAddressRecord(reverseAddressData.has_rev);
      });
  }, [address, setHasReverseAddressRecord]);

  // we get the list of domains that do not have a autorenewal already enabled
  useEffect(() => {
    if (type !== FormType.RENEW) return;
    if (address) {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_non_subscribed_domains?addr=${address}`
      )
        .then((response) => response.json())
        .then((data) => {
          setNonSubscribedDomains(data);
        });
    }
  }, [address, renewalBox, type]);

  // we get the list of domains that do not have a autorenewal already enabled
  useEffect(() => {
    if (type !== FormType.RENEW) return;
    if (address) {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_non_subscribed_domains?addr=${address}`
      )
        .then((response) => response.json())
        .then((data) => {
          setNonSubscribedDomains(data);
        });
    }
  }, [address, renewalBox, type]);

  const onChangeTermsBox = () => setTermsBox(!termsBox);
  const onChangeRenewalBox = () => setRenewalBox(!renewalBox);
  const onChangeMainDomainBox = () => setMainDomainBox(!mainDomainBox);

  return {
    termsBox,
    renewalBox,
    mainDomainBox,
    hasUserSelectedOffer,
    hasReverseAddressRecord,
    domainsMinting,
    reducedDuration,
    nonSubscribedDomains,
    sponsor,
    hasMainDomain,
    setHasUserSelectedOffer,
    setHasReverseAddressRecord,
    setDomainsMinting,
    setReducedDuration,
    setNonSubscribedDomains,
    onChangeTermsBox,
    onChangeRenewalBox,
    onChangeMainDomainBox,
  };
};
