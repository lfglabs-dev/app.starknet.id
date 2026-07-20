import React, { type FunctionComponent, useState } from "react";
import { Divider } from "@mui/material";
import Button from "@/components/UI/button";
import CloseIcon from "@/components/UI/iconsComponents/icons/closeIcon";
import Notification from "@/components/UI/notification";
import RegisterCheckboxes from "@/components/domains/registerCheckboxes";
import RegisterSummary from "@/components/domains/registerSummary";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import type { TransactionIntent } from "@/lib/core/types";
import styles from "@/styles/components/registerV3.module.css";

type CheckoutCardProps = {
  type: "register" | "renew";
  domain?: string;
  durationInYears: number;
  price?: bigint;
  loadingPrice?: boolean;
  priceError?: string;
  termsAccepted: boolean;
  onTermsChange: () => void;
  setMain?: boolean;
  showMainDomainBox?: boolean;
  onSetMainChange?: () => void;
  prepare: () => Promise<TransactionIntent>;
  disabled?: boolean;
  onClose: () => void;
  onSubmitted?: (hash: string) => void;
};

const CheckoutCard: FunctionComponent<CheckoutCardProps> = ({
  type,
  domain,
  durationInYears,
  price,
  loadingPrice,
  priceError,
  termsAccepted,
  onTermsChange,
  setMain,
  showMainDomainBox = false,
  onSetMainChange,
  prepare,
  disabled = false,
  onClose,
  onSubmitted,
}) => {
  const submitPrepared = usePreparedTransaction();
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>();

  async function execute(): Promise<void> {
    if (submitting) return;
    setSubmissionError(undefined);
    setSubmitting(true);
    try {
      const hash = await submitPrepared(prepare);
      onSubmitted?.(hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("insufficient balance")) {
        setSubmissionError(
          "Insufficient balance to complete this purchase. Please add funds and try again."
        );
      } else {
        setSubmissionError(message || "Could not submit this purchase. Please try again.");
      }
      console.error(
        `Failed to submit the ${type === "register" ? "registration" : "renewal"}:`,
        error
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getButtonText(): string {
    if (!termsAccepted) return "Please accept terms & policies";
    return "Purchase";
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.checkout}>
          <RegisterSummary
            durationInYears={durationInYears}
            price={price}
            loadingPrice={loadingPrice}
          />
          {priceError ? (
            <p className="px-5 pb-2 text-center text-sm text-red-700" role="alert">
              {priceError}
            </p>
          ) : null}
          <Divider className={styles.divider} />
          <div className={styles.checkoutSummary}>
            <RegisterCheckboxes
              termsBox={termsAccepted}
              onChangeTermsBox={onTermsChange}
              showMainDomainBox={showMainDomainBox}
              mainDomainBox={setMain}
              onChangeMainDomainBox={onSetMainChange}
              domain={domain}
            />
            <div className={styles.checkoutButton}>
              <div
                className={
                  !termsAccepted
                    ? "flex flex-col-reverse gap-2"
                    : "flex gap-4"
                }
              >
                <div className="flex sm:hidden">
                  <div className={styles.cancelBtn} onClick={onClose}>
                    Cancel
                  </div>
                </div>
                <Button
                  onClick={() => void execute()}
                  disabled={
                    submitting ||
                    disabled ||
                    !termsAccepted ||
                    loadingPrice ||
                    Boolean(priceError)
                  }
                >
                  {getButtonText()}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.closeIcon}>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>
      <Notification
        visible={Boolean(submissionError)}
        onClose={() => setSubmissionError(undefined)}
      >
        {submissionError}
      </Notification>
    </>
  );
};

export default CheckoutCard;
