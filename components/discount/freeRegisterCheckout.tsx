import React from "react";
import type { FunctionComponent } from "react";
import { useEffect, useState } from "react";
import Button from "../UI/button";
import { utils } from "starknetid.js";
import { getDomainWithStark } from "../../utils/stringService";
import { posthog } from "posthog-js";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import { Divider } from "@mui/material";
import registrationCalls from "../../utils/callData/registrationCalls";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import BackButton from "../UI/backButton";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";
import ConnectButton from "../UI/connectButton";
import { getFreeDomain } from "@/utils/campaignService";
import TermCheckbox from "../domains/termCheckbox";
import { useRouter } from "next/router";
import FreeRegisterSummary from "./freeRegisterSummary";
import { useAccount } from "@starknet-react/core";
import { Call } from "starknet";
import usePaymaster from "@/hooks/paymaster";

type FreeRegisterCheckoutProps = {
  domain: string;
  durationInDays: number;
  goBack: () => void;
  couponCode?: boolean;
  couponHelper?: string;
  banner: string;
};

const FreeRegisterCheckout: FunctionComponent<FreeRegisterCheckoutProps> = ({
  domain,
  durationInDays,
  goBack,
  couponCode,
  couponHelper,
  banner,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [callData, setCallData] = useState<Call[]>([]);
  const [loadingCallData, setLoadingCallData] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const { account, address } = useAccount();
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const [tokenId, setTokenId] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [signature, setSignature] = useState<string[]>(["", ""]);
  const [loadingCoupon, setLoadingCoupon] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const {
    handleRegister,
    data: registerData,
    paymasterRewards,
    loadingGas,
    loadingDeploymentData,
    refreshRewards,
    invalidTx,
    txErrorMessage,
    txShortErrorMessage,
    loadingTypedData,
  } = usePaymaster(
    callData,
    async (transactionHash) => {
      setDomainsMinting((prev) =>
        new Map(prev).set(encodedDomain.toString(), true)
      );
      if (transactionHash) setTransactionHash(transactionHash);
    },
    loadingCallData
  );

  useEffect(() => {
    if (!registerData?.transaction_hash) return;
    setTransactionHash(registerData.transaction_hash);
  }, [registerData]);

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, []);

  useEffect(() => {
    if (address) setTargetAddress(address);
  }, [address]);

  useEffect(() => {
    if (loadingCoupon || !coupon) return;
    refreshRewards();
  }, [loadingCoupon, coupon, refreshRewards, address]);

  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt) return;
    (async () => {
      setMetadataHash(await computeMetadataHash("none", "none", salt));
    })();
  }, [salt]);

  useEffect(() => {
    if (signature[0] === null) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    setTokenId(newTokenId);
    const txMetadataHash = `0x${metadataHash}` as HexString;
    const freeRegisterCalls = registrationCalls.getFreeRegistrationCalls(
      newTokenId,
      encodedDomain,
      signature,
      txMetadataHash
    );
    setCallData(freeRegisterCalls);
    setLoadingCallData(false);
  }, [metadataHash, encodedDomain, signature]);

  function changeCoupon(value: string): void {
    setCoupon(value);
    setLoadingCoupon(true);
  }

  useEffect(() => {
    if (!transactionHash) return;
    posthog?.capture("register");
    addTransaction({
      timestamp: Date.now(),
      subtext: "Domain registration",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.BUY_DOMAIN,
        hash: transactionHash,
        status: "pending",
      },
    });

    router.push(`/confirmation?tokenId=${tokenId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionHash, tokenId]);

  useEffect(() => {
    if (!coupon) return setLoadingCoupon(false);
    if (!address) return;
    setLoadingCallData(true);
    getFreeDomain(address, `${domain}.stark`, coupon).then((res) => {
      if (res.error)
        setCouponError(
          typeof res.error === "string" ? res.error : JSON.stringify(res.error)
        );
      else {
        const signature = [res.r, res.s];
        setSignature(signature);
        setCouponError("");
      }
      setLoadingCoupon(false);
    });
  }, [coupon, domain, address]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={() => goBack()} />
          <div className="flex flex-col items-start gap-4 self-stretch">
            <p className={styles.legend}>Your registration</p>
            <h3 className={styles.domain}>{getDomainWithStark(domain)}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            {couponCode ? (
              <TextField
                helperText={couponHelper}
                label="Coupon code"
                value={coupon}
                onChange={(e) => changeCoupon(e.target.value)}
                color="secondary"
                error={Boolean(couponError)}
                errorMessage={couponError}
              />
            ) : null}
          </div>
        </div>
        <div className={styles.summary}>
          <FreeRegisterSummary
            durationInDays={durationInDays}
            domain={domain}
          />
          <Divider className="w-full" />
          <TermCheckbox
            checked={termsBox}
            onChange={() => setTermsBox(!termsBox)}
          />
          {invalidTx && txErrorMessage ? (
            <p className={styles.errorMessage}>{txErrorMessage}</p>
          ) : null}
          {address ? (
            <Button
              onClick={handleRegister}
              disabled={
                (domainsMinting.get(encodedDomain) as boolean) ||
                !account ||
                !coupon ||
                !durationInDays ||
                !targetAddress ||
                !termsBox ||
                Boolean(couponError) ||
                loadingCoupon ||
                loadingGas ||
                loadingDeploymentData ||
                loadingTypedData
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : couponError || !coupon
                ? "Enter a valid Coupon"
                : loadingCallData
                ? "Loading call data"
                : loadingGas
                ? invalidTx
                  ? txShortErrorMessage
                  : "Loading gas"
                : loadingTypedData
                ? "Building typed data"
                : loadingDeploymentData
                ? paymasterRewards.length > 0
                  ? "Loading deployment data"
                  : "No Paymaster reward available"
                : "Register my domain"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <div
        className={styles.image}
        style={{
          backgroundImage: `url(${banner})`,
        }}
      />
    </div>
  );
};

export default FreeRegisterCheckout;
