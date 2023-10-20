import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useEtherContract } from "../../hooks/contracts";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import {
  formatHexString,
  isValidEmail,
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "../../utils/stringService";
import { gweiToEth, applyRateToBigInt } from "../../utils/feltService";
import { Abi, Call } from "starknet";
import { posthog } from "posthog-js";
import TxConfirmationModal from "../UI/txConfirmationModal";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import UsForm from "./usForm";
import { Divider } from "@mui/material";
import RegisterSummary from "./registerSummary";
import salesTax from "sales-tax";
import Wallets from "../UI/wallets";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import {
  areDomainSelected,
  getPriceFromDomains,
} from "../../utils/priceService";
import RenewalDomainsBox from "./renewalDomainsBox";
import registrationCalls from "../../utils/callData/registrationCalls";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import BackButton from "../UI/backButton";
import { useRouter } from "next/router";
import RegisterCheckboxes from "./registerCheckboxes";
import { utils } from "starknetid.js";
import { getPriceFromDomain } from "../../utils/priceService";

type RenewalProps = {
  groups: string[];
};

const Renewal: FunctionComponent<RenewalProps> = ({ groups }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [price, setPrice] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { contract: etherContract } = useEtherContract();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  // const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [selectedDomains, setSelectedDomains] =
    useState<Record<string, boolean>>();
  const { address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "balanceOf",
      args: [address],
    });
  const { writeAsync: execute, data: renewData } = useContractWrite({
    calls: callData,
  });
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const { addTransaction } = useTransactionManager();
  const router = useRouter();
  const duration = 1; // on year by default

  useEffect(() => {
    if (!renewData?.transaction_hash || !salt) return;
    posthog?.capture("renewal from page");

    // register the metadata to the sales manager db
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_hash: metadataHash,
        email,
        tax_state: isUsResident ? usState : "none",
        salt: salt,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on sending metadata:", err));

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

    addTransaction({ hash: renewData.transaction_hash });
    setIsTxModalOpen(true);
  }, [renewData, salt, email, usState]);

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, []);

  // we update compute the purchase metadata hash
  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt) return;
    (async () => {
      setMetadataHash(
        await computeMetadataHash(
          email,
          //groups, // default group for domain Owner
          isUsResident ? usState : "none",
          salt
        )
      );
    })();
  }, [email, usState, salt, renewalBox]);

  useEffect(() => {
    if (!selectedDomains) return;
    setPrice(
      getPriceFromDomains(
        selectedDomainsToArray(selectedDomains),
        duration
      ).toString()
    );
  }, [selectedDomains]);

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("");
    else {
      const high = userBalanceData?.["balance"].high << BigInt(128);
      setBalance((userBalanceData?.["balance"].low + high).toString(10));
    }
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
    if (isUsResident) {
      salesTax.getSalesTax("US", usState).then((tax) => {
        setSalesTaxRate(tax.rate);
        if (price) setSalesTaxAmount(applyRateToBigInt(price, tax.rate));
      });
    } else {
      setSalesTaxRate(0);
      setSalesTaxAmount("");
    }
  }, [isUsResident, usState, price]);

  useEffect(() => {
    if (selectedDomains) {
      const calls = [
        registrationCalls.approve(price),
        ...registrationCalls.multiCallRenewal(
          selectedDomainsToEncodedArray(selectedDomains),
          duration
        ),
      ];

      // If the user is a US resident, we add the sales tax
      if (salesTaxRate) {
        calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      }

      if (renewalBox) {
        calls.push(autoRenewalCalls.approve());
        selectedDomainsToArray(selectedDomains).map((domain) => {
          const encodedDomain = utils
            .encodeDomain(domain)
            .map((element) => element.toString())[0];
          const price = getPriceFromDomain(1, domain);
          const allowance: string = salesTaxRate
            ? (
                Number(price) + applyRateToBigInt(price, salesTaxRate)
              ).toString()
            : price.toString();
          calls.push(
            autoRenewalCalls.enableRenewal(
              encodedDomain,
              allowance,
              "0x" + metadataHash
            )
          );
        });
      }

      setCallData(calls);
    }
  }, [selectedDomains, price, salesTaxRate]);

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
              errorMessage={"Please enter a valid email address"}
              type="email"
            />
            <UsForm
              isUsResident={isUsResident}
              onUsResidentChange={() => setIsUsResident(!isUsResident)}
              usState={usState}
              changeUsState={(value) => setUsState(value)}
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
            duration={1}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isUsResident={isUsResident}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
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
                // !termsBox ||
                (isUsResident && !usState) ||
                emailError ||
                !areDomainSelected(selectedDomains)
              }
            >
              {/* {!termsBox
                ? "Please accept terms & policies"
                :  */}
              {isUsResident && !usState
                ? "We need your US State"
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
      <TxConfirmationModal
        txHash={renewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your domain is on it's way !"
      />
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default Renewal;
