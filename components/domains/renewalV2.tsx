import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "@starknet-react/core";
import CheckoutCard from "@/components/domains/steps/checkoutCard";
import RegisterSteps from "@/components/domains/steps/registerSteps";
import UserInfoForm from "@/components/domains/steps/userInfoForm";
import { useOwnedIdentities } from "@/hooks/useOwnedIdentities";
import { readPrice } from "@/lib/chain/contracts";
import { normalizeDomain, renewableDomains } from "@/lib/chain/domain";
import { prepareRenewManyIntent } from "@/lib/transactions/intents";
import styles from "@/styles/components/registerV3.module.css";

export default function RenewalV2() {
  const router = useRouter();
  const { address } = useAccount();
  const { identities, loading } = useOwnedIdentities();
  const [currentStep, setCurrentStep] = useState(1);
  const [years, setYears] = useState(1);
  const [selectedDomains, setSelectedDomains] = useState<Record<string, boolean>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [price, setPrice] = useState<bigint>();
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  const domains = useMemo(() => {
    const queryDomain = typeof router.query.domain === "string" ? router.query.domain : "";
    const remembered = identities.flatMap((identity) => identity.importedDomains);
    if (queryDomain) {
      try {
        remembered.unshift(normalizeDomain(queryDomain));
      } catch {
        // Validation is surfaced when continuing.
      }
    }
    return renewableDomains(remembered);
  }, [identities, router.query.domain]);

  const chosenDomains = useMemo(
    () => domains.filter((domain) => selectedDomains[domain]),
    [domains, selectedDomains]
  );

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    setSelectedDomains((current) => {
      return domains.reduce<Record<string, boolean>>((next, domain) => {
        next[domain] = current[domain] ?? true;
        return next;
      }, {});
    });
  }, [domains]);

  useEffect(() => {
    let cancelled = false;
    if (!chosenDomains.length) {
      setPrice(undefined);
      setPriceLoading(false);
      return;
    }
    setPriceLoading(true);
    setPriceError("");
    void Promise.all(chosenDomains.map((domain) => readPrice("renew", domain, years * 365)))
      .then((prices) => {
        if (!cancelled) setPrice(prices.reduce((total, result) => total + result.amount, 0n));
      })
      .catch((loadError) => {
        if (!cancelled) {
          setPrice(undefined);
          setPriceError(loadError instanceof Error ? loadError.message : "Could not read the renewal price");
        }
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chosenDomains, years]);

  function goToCheckout(): void {
    if (!chosenDomains.length) return;
    chosenDomains.forEach(normalizeDomain);
    setCurrentStep(3);
  }

  const canContinue = Boolean(address && chosenDomains.length && years >= 1 && years <= 25);

  return (
    <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-3 lg:px-32 md:px-16 sm:pb-12 xl:min-h-[88vh]">
      <aside className={styles.purchaseStepNav} role="navigation">
        <RegisterSteps currentStep={currentStep} setStep={setCurrentStep} isLoading={loading} />
        <img src="/visuals/purchaseStepVisual.svg" alt="Domain purchase steps visualization" />
      </aside>
      <div className={styles.purchaseStepNavMobile} role="navigation">
        <RegisterSteps currentStep={currentStep} setStep={setCurrentStep} isLoading={loading} />
        <div className="flex justify-center">
          <img src="/visuals/purchaseStepVisualMobile.svg" alt="Domain purchase steps visualization" />
        </div>
      </div>
      <div className="flex-1 w-full xl:w-[932px] xl:min-w-[932px] border-solid">
        {currentStep === 1 ? (
          <UserInfoForm
            type="renew"
            title="Renew Your domain(s)"
            durationInYears={years}
            onDurationChange={setYears}
            domains={domains}
            selectedDomains={selectedDomains}
            setSelectedDomains={setSelectedDomains}
            loading={loading}
            connected={Boolean(address)}
            disabled={!canContinue}
            onNext={goToCheckout}
            onClose={() => router.back()}
          />
        ) : (
          <CheckoutCard
            type="renew"
            durationInYears={years}
            price={price}
            loadingPrice={priceLoading}
            priceError={priceError}
            termsAccepted={termsAccepted}
            onTermsChange={() => setTermsAccepted((value) => !value)}
            prepare={() => prepareRenewManyIntent({ owner: address ?? "", domains: chosenDomains, days: years * 365 })}
            disabled={!canContinue}
            onClose={() => router.back()}
            onSubmitted={() => void router.push("/identities")}
          />
        )}
      </div>
    </div>
  );
}
