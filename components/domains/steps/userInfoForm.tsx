import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import Button from "@/components/UI/button";
import CloseIcon from "@/components/UI/iconsComponents/icons/closeIcon";
import ConnectButton from "@/components/UI/connectButton";
import NumberTextField from "@/components/UI/numberTextField";
import RenewalDomainsBox from "@/components/domains/renewalDomainsBox";
import SelectIdentity from "@/components/domains/selectIdentity";
import type { OwnedIdentity } from "@/lib/core/types";
import styles from "@/styles/components/registerV3.module.css";

type UserInfoFormProps = {
  type: "register" | "renew";
  title: string;
  durationInYears: number;
  onDurationChange: (value: number) => void;
  identities?: OwnedIdentity[];
  selectedIdentity?: string;
  onIdentityChange?: (value: string) => void;
  domains?: string[];
  selectedDomains?: Record<string, boolean>;
  setSelectedDomains?: Dispatch<SetStateAction<Record<string, boolean>>>;
  loading?: boolean;
  connected: boolean;
  disabled?: boolean;
  onNext: () => void;
  onClose: () => void;
};

const MAX_YEARS = 25;

const UserInfoForm: FunctionComponent<UserInfoFormProps> = ({
  type,
  title,
  durationInYears,
  onDurationChange,
  identities = [],
  selectedIdentity = "new",
  onIdentityChange,
  domains = [],
  selectedDomains = {},
  setSelectedDomains,
  loading = false,
  connected,
  disabled = false,
  onNext,
  onClose,
}) => {
  function changeDuration(value: number): void {
    if (!Number.isFinite(value) || value < 1 || value > MAX_YEARS) return;
    onDurationChange(value);
  }

  const hasRenewalSelection = Object.values(selectedDomains).some(Boolean);
  const buttonText = type === "renew" && !hasRenewalSelection
    ? "Select a domain to renew"
    : "Next step";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.closeIcon} onClick={onClose}>
          <CloseIcon />
        </div>
        <div className={styles.form}>
          <div className="flex flex-col items-center self-stretch pt-[30px] xl:pt-[60px]">
            <h3 className={styles.domain}>{title}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            {type === "register" ? (
              <SelectIdentity identities={identities} value={selectedIdentity} onChange={(value) => onIdentityChange?.(value)} />
            ) : null}
            <NumberTextField
              value={durationInYears}
              label={`Years to ${type === "renew" ? "renew" : "register"} (max 25 years)`}
              placeholder="years"
              onChange={(event) => changeDuration(Number(event.target.value))}
              incrementValue={() => changeDuration(durationInYears + 1)}
              decrementValue={() => changeDuration(durationInYears - 1)}
              color="secondary"
              required
            />
            <div className="w-full">
              {type === "renew" && setSelectedDomains ? (
                <RenewalDomainsBox
                  domains={domains}
                  loading={loading}
                  selectedDomains={selectedDomains}
                  setSelectedDomains={setSelectedDomains}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles.summary}>
          <div className="flex justify-between gap-8">
            <div onClick={onClose} className={`${styles.cancelBtn} xl:hidden`}>
              Cancel
            </div>
            {connected ? (
              <Button onClick={onNext} disabled={disabled}>{buttonText}</Button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;
