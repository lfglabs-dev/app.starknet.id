import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "@starknet-react/core";
import CheckoutCard from "@/components/domains/steps/checkoutCard";
import RegisterSteps from "@/components/domains/steps/registerSteps";
import UserInfoForm from "@/components/domains/steps/userInfoForm";
import { useOwnedIdentities } from "@/hooks/useOwnedIdentities";
import { readPrice } from "@/lib/chain/contracts";
import { prepareRegisterIntent } from "@/lib/transactions/intents";
import styles from "@/styles/components/registerV3.module.css";

type RegisterV3Props = {
  domain: string;
  setDomain: (domain: string) => void;
};

export default function RegisterV3({ domain }: RegisterV3Props) {
  const router = useRouter();
  const { address } = useAccount();
  const { identities, loading } = useOwnedIdentities();
  const [currentStep, setCurrentStep] = useState(1);
  const [years, setYears] = useState(1);
  const [selectedIdentity, setSelectedIdentity] = useState("new");
  const [setMain, setSetMain] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [price, setPrice] = useState<bigint>();
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    let cancelled = false;
    setPriceLoading(true);
    setPriceError("");
    void readPrice("buy", domain, years * 365)
      .then((result) => {
        if (!cancelled) setPrice(result.amount);
      })
      .catch((error) => {
        if (!cancelled) {
          setPrice(undefined);
          setPriceError(error instanceof Error ? error.message : "Could not read the registration price");
        }
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain, years]);

  const mintIdentity = selectedIdentity === "new";
  const canContinue = Boolean(address && domain && years >= 1 && years <= 25 && (mintIdentity || selectedIdentity));
  const hasMainDomain = identities.some((identity) => identity.isMain);

  return (
    <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 xl:h-[88vh]">
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
      <div className="flex-1">
        {currentStep === 1 ? (
          <UserInfoForm
            type="register"
            title={domain}
            durationInYears={years}
            onDurationChange={setYears}
            identities={identities}
            selectedIdentity={selectedIdentity}
            onIdentityChange={setSelectedIdentity}
            loading={loading}
            connected={Boolean(address)}
            disabled={!canContinue}
            onNext={() => setCurrentStep(3)}
            onClose={() => router.back()}
          />
        ) : (
          <CheckoutCard
            type="register"
            domain={domain}
            durationInYears={years}
            price={price}
            loadingPrice={priceLoading}
            priceError={priceError}
            termsAccepted={termsAccepted}
            onTermsChange={() => setTermsAccepted((value) => !value)}
            setMain={setMain}
            showMainDomainBox={hasMainDomain}
            onSetMainChange={() => setSetMain((value) => !value)}
            prepare={() => prepareRegisterIntent({
              owner: address ?? "",
              domain,
              days: years * 365,
              tokenId: mintIdentity ? undefined : selectedIdentity,
              mintIdentity,
              setMain: !hasMainDomain || setMain,
            })}
            disabled={!canContinue}
            onClose={() => router.back()}
            onSubmitted={() => void router.push("/identities")}
          />
        )}
      </div>
    </div>
  );
}
