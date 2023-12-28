import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount, useBalance, useContractWrite } from "@starknet-react/core";
import {
  formatHexString,
  isValidEmail,
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "../../utils/stringService";
import { gweiToEth, applyRateToBigInt } from "../../utils/feltService";
import { Call } from "starknet";
import { posthog } from "posthog-js";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import SwissForm from "./swissForm";
import { Divider } from "@mui/material";
import RegisterSummary from "./registerSummary";
import Wallets from "../UI/wallets";
import {
  computeMetadataHash,
  generateSalts,
} from "../../utils/userDataService";
import {
  areDomainSelected,
  getPriceFromDomains,
  getPriceFromDomain,
} from "../../utils/priceService";
import RenewalDomainsBox from "./renewalDomainsBox";
import registrationCalls from "../../utils/callData/registrationCalls";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import BackButton from "../UI/backButton";
import { useRouter } from "next/router";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  NotificationType,
  TransactionType,
  swissVatRate,
} from "../../utils/constants";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import { utils } from "starknetid.js";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";
import NumberTextField from "../UI/numberTextField";
import useAllowanceCheck from "../../hooks/useAllowanceCheck";

type RenewalProps = {
  groups: string[];
};

const Renewal: FunctionComponent<RenewalProps> = ({ groups }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [price, setPrice] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [salts, setSalts] = useState<string[] | undefined>();
  const [metadataHashes, setMetadataHashes] = useState<string[] | undefined>();
  const [selectedDomains, setSelectedDomains] =
    useState<Record<string, boolean>>();
  const { address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } = useBalance({
    address,
    watch: true,
  });
  const { writeAsync: execute, data: renewData } = useContractWrite({
    calls: callData,
  });
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const [duration, setDuration] = useState<number>(1);
  const maxYearsToRegister = 25;
  const needsAllowance = useAllowanceCheck(address);

  useEffect(() => {
    if (!renewData?.transaction_hash || !salts || !metadataHashes) return;
    posthog?.capture("renewal from page");

    // register the metadata to the sales manager db
    Promise.all(
      salts.map((salt, index) =>
        fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meta_hash: metadataHashes[index],
            email,
            tax_state: isSwissResident ? "switzerland" : "none",
            salt: salt,
          }),
        })
      )
    )
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .catch((error) => {
        console.log("Error on sending metadata:", error);
      });

    // Subscribe to auto renewal mailing list if renewal box is checked
    if (renewalBox) {
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/mail_subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_hash: formatHexString(renewData.transaction_hash),
          groups,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error on registering to email:", err));
    }

    addTransaction({
      timestamp: Date.now(),
      subtext: "Domain renewal",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.RENEW_DOMAIN,
        hash: renewData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renewData]); // We only need renewData here because we don't want to send the metadata twice (we send it once the tx is sent)

  // on first load, we generate a salt
  useEffect(() => {
    if (!selectedDomains) return;

    setSalts(generateSalts(selectedDomainsToArray(selectedDomains).length));
  }, [selectedDomains]);

  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salts) return;

    const computeHashes = async () => {
      const metaDataHashes = await Promise.all(
        salts.map((salt) =>
          computeMetadataHash(
            email,
            //groups, // default group for domain Owner
            isSwissResident ? "switzerland" : "none",
            salt
          )
        )
      );
      setMetadataHashes(metaDataHashes);
    };

    computeHashes();
  }, [email, salts, renewalBox, isSwissResident]);

  useEffect(() => {
    if (!selectedDomains) return;
    setPrice(
      getPriceFromDomains(
        selectedDomainsToArray(selectedDomains),
        duration
      ).toString()
    );
  }, [selectedDomains, duration]);

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("");
    else setBalance(userBalanceData.value.toString(10));
  }, [userBalanceData, userBalanceDataError]);

  useEffect(() => {
    if (balance && price) {
      if (gweiToEth(balance) > gweiToEth(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [balance, price]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  useEffect(() => {
    if (isSwissResident) {
      setSalesTaxRate(swissVatRate);
      setSalesTaxAmount(applyRateToBigInt(price, swissVatRate));
    } else {
      setSalesTaxRate(0);
      setSalesTaxAmount("");
    }
  }, [isSwissResident, price]);

  useEffect(() => {
    if (selectedDomains && metadataHashes) {
      const calls = [
        registrationCalls.approve(price),
        ...registrationCalls.multiCallRenewal(
          selectedDomainsToEncodedArray(selectedDomains),
          duration,
          metadataHashes
        ),
      ];

      // If the user is a US resident, we add the sales tax
      if (salesTaxRate) {
        calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      }

      if (renewalBox) {
        if (needsAllowance) {
          calls.push(autoRenewalCalls.approve());
        }

        selectedDomainsToArray(selectedDomains).map((domain, index) => {
          const encodedDomain = utils
            .encodeDomain(domain)
            .map((element) => element.toString())[0];
          const price = getPriceFromDomain(1, domain);
          const allowance: string = salesTaxRate
            ? (
                BigInt(price) + BigInt(applyRateToBigInt(price, salesTaxRate))
              ).toString()
            : price.toString();
          calls.push(
            autoRenewalCalls.enableRenewal(
              encodedDomain,
              allowance,
              "0x" + metadataHashes?.[index]
            )
          );
        });
      }
      setCallData(calls);
    }
  }, [
    selectedDomains,
    price,
    salesTaxAmount,
    needsAllowance,
    metadataHashes,
    salesTaxRate,
    duration,
    renewalBox,
  ]);

  function changeDuration(value: number): void {
    if (isNaN(value) || value > maxYearsToRegister || value < 1) return;
    setDuration(value);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={() => router.back()} />
          <div className="flex flex-col items-start gap-0 self-stretch">
            <p className={styles.legend}>Your renewal</p>
            <h3 className={styles.domain}>Renew Your domain(s)</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            <TextField
              helperText="Secure your domain's future and stay ahead with vital updates. Your email stays private with us, always."
              label="Email address"
              value={email}
              onChange={(e) => changeEmail(e.target.value)}
              color="secondary"
              error={emailError}
              errorMessage="Please enter a valid email address"
              type="email"
            />
            <SwissForm
              isSwissResident={isSwissResident}
              onSwissResidentChange={() => setIsSwissResident(!isSwissResident)}
            />
            <NumberTextField
              value={duration}
              label="Years to renew (max 25 years)"
              placeholder="years"
              onChange={(e) => changeDuration(Number(e.target.value))}
              incrementValue={() =>
                setDuration(
                  duration < maxYearsToRegister ? duration + 1 : duration
                )
              }
              decrementValue={() =>
                setDuration(duration > 1 ? duration - 1 : duration)
              }
              color="secondary"
              required
            />
            <RenewalDomainsBox
              helperText="Check the box of the domains you want to renew"
              setSelectedDomains={setSelectedDomains}
              selectedDomains={selectedDomains}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={price}
            duration={duration}
            renewalBox={renewalBox}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            renewalBox={renewalBox}
          />
          {address ? (
            <Button
              onClick={() =>
                execute().then(() => {
                  setDomainsMinting(selectedDomains);
                })
              }
              disabled={
                domainsMinting === selectedDomains ||
                !address ||
                invalidBalance ||
                !termsBox ||
                emailError ||
                !areDomainSelected(selectedDomains)
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : invalidBalance
                ? "You don't have enough eth"
                : !areDomainSelected(selectedDomains)
                ? "Select a domain to renew"
                : emailError
                ? "Enter a valid Email"
                : "Renew my domain(s)"}
            </Button>
          ) : (
            <Button onClick={() => setWalletModalOpen(true)}>
              Connect wallet
            </Button>
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/registerV2.webp" />
      <RegisterConfirmationModal
        txHash={renewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => window.history.back()}
      />
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default Renewal;
