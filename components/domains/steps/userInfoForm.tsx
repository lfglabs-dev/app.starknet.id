import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import { FormType } from "@/utils/constants";
import { getDomainWithStark } from "@/utils/stringService";
import SwissForm from "../swissForm";
import SelectIdentity from "../selectIdentity";
import NumberTextField from "@/components/UI/numberTextField";
import { useAccount } from "@starknet-react/core";
import Button from "@/components/UI/button";
import RenewalDomainsBox from "../renewalDomainsBox";
import { areDomainSelected } from "@/utils/priceService";
import CloseIcon from "@/components/UI/iconsComponents/icons/closeIcon";
import ConnectButton from "@/components/UI/connectButton";
import { useRouter } from 'next/router';

type UserInfoFormProps = {
  type: FormType;
  goToNextStep: () => void;
  canUpdateDuration?: boolean;
  minDuration?: number;
};

export enum IncrementType {
  INCREMENT,
  DECREMENT,
  SET,
}

const UserInfoForm: FunctionComponent<UserInfoFormProps> = ({
  type,
  goToNextStep,
}) => {
  const router = useRouter();
  const maxYearsToRegister = 25;
  const { address } = useAccount();
  const { formState, updateFormState } = useContext(FormContext);
  const [selectedDomains, setSelectedDomains] =
    useState<Record<string, boolean>>();

  useEffect(() => {
    if (type === FormType.REGISTER) return;
    updateFormState({ selectedDomains });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomains, type]); // Don't call updateFromState on every render


  function changeTokenId(value: number): void {
    updateFormState({ tokenId: value });
  }

  function changeDuration(
    type: IncrementType,
    value: number = formState.durationInYears
  ): void {
    let newValue = value;

    switch (type) {
      case IncrementType.INCREMENT:
        newValue = value < maxYearsToRegister ? value + 1 : value;
        break;
      case IncrementType.DECREMENT:
        newValue = value > 1 ? value - 1 : value;
        break;
      case IncrementType.SET:
        break;
    }

    if (isNaN(newValue) || newValue > maxYearsToRegister || newValue < 1)
      return;
    updateFormState({
      durationInYears: newValue,
      isUpselled: newValue === 1 ? true : false,
    });
  }

  const getTitle = () => {
    switch (type) {
      case FormType.REGISTER:
        // Fetch the domain name from the selectedDomains object in context for the title of the section
        return getDomainWithStark(Object.keys(formState.selectedDomains)[0]);
      case FormType.RENEW:
        return "Renew Your domain(s)";
      default:
        return "";
    }
  };

  const getButtonText = (): string => {
    return type === FormType.RENEW && !areDomainSelected(formState.selectedDomains)
      ? "Select a domain to renew"
      : "Next step";
  };

  const isDisabled = (): boolean => {
    return (
      !formState.durationInYears ||
      formState.durationInYears < 1 ||
      (type === FormType.RENEW && !areDomainSelected(formState.selectedDomains))
    );
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.closeIcon} onClick={handleClose}>
          <CloseIcon  />
        </div>
        <div className={styles.form}>
          <div className="flex flex-col items-center gap-4 self-stretch">
            <h3 className={styles.domain}>{getTitle()}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            <SwissForm
              isSwissResident={formState.isSwissResident}
              onSwissResidentChange={() =>
                updateFormState({
                  isSwissResident: !formState.isSwissResident,
                })
              }
            />
            {type === FormType.REGISTER ? (
              <SelectIdentity
                tokenId={formState.tokenId}
                changeTokenId={changeTokenId}
              />
            ) : null}
            <NumberTextField
              value={formState.durationInYears}
              label="Years to register (max 25 years)"
              placeholder="years"
              onChange={(e) =>
                changeDuration(IncrementType.SET, Number(e.target.value))
              }
              incrementValue={() => changeDuration(IncrementType.INCREMENT)}
              decrementValue={() => changeDuration(IncrementType.DECREMENT)}
              color="secondary"
              required
            />
            <div className="w-full">
              {type === FormType.RENEW ? (
                <RenewalDomainsBox
                  helperText="Check the box of the domains you want to renew"
                  setSelectedDomains={setSelectedDomains}
                  selectedDomains={formState.selectedDomains}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles.summary}>
          <div className="flex justify-between gap-8">
          <div onClick={handleClose} className={`${styles.cancelBtn} xl:hidden`}>
    Cancel
  </div>
            {address ? (
              <Button onClick={goToNextStep} disabled={isDisabled()}>
                {getButtonText()}
              </Button>
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
