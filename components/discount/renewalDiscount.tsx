import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import {
  formatHexString,
  isValidEmail,
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "../../utils/stringService";
import {
  gweiToEth,
  applyRateToBigInt,
  numberToFixedString,
} from "../../utils/feltService";
import { Abi, Call } from "starknet";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import SwissForm from "../domains/swissForm";
import { Divider } from "@mui/material";
import RegisterSummary from "../domains/registerSummary";
import Wallets from "../UI/wallets";
import {
  computeMetadataHash,
  generateSalts,
} from "../../utils/userDataService";
import {
  areDomainSelected,
  getPriceFromDomain,
} from "../../utils/priceService";
import RenewalDomainsBox from "../domains/renewalDomainsBox";
import registrationCalls from "../../utils/callData/registrationCalls";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import BackButton from "../UI/backButton";
import { useRouter } from "next/router";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  NotificationType,
  TransactionType,
  UINT_128_MAX,
  swissVatRate,
} from "../../utils/constants";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import { utils } from "starknetid.js";
import { useEtherContract } from "../../hooks/contracts";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";

type RenewalDiscountProps = {
  groups: string[];
  goBack: () => void;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  isArOnforced?: boolean;
};

const RenewalDiscount: FunctionComponent<RenewalDiscountProps> = ({
  groups,
  price,
  duration,
  discountId,
  customMessage,
  goBack,
  isArOnforced = false,
}) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [balance, setBalance] = useState<string>("");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [salts, setSalts] = useState<string[] | undefined>();
  const [metadataHashes, setMetadataHashes] = useState<string[] | undefined>();
  const [needMetadata, setNeedMetadata] = useState<boolean>(false);
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
  const { contract: etherContract } = useEtherContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "allowance",
      args: [
        address as string,
        process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      ],
    });

  useEffect(() => {
    if (!renewData?.transaction_hash || !salts || !metadataHashes) return;
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
    if (!address) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${address}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.meta_hash && parseInt(data.meta_hash) !== 0) {
          setNeedMetadata(false);
          setMetadataHashes([data.meta_hash]);
          data.tax_rate ? setSalesTaxRate(data.tax_rate) : setSalesTaxRate(0);
        } else {
          setNeedMetadata(true);
        }
      })
      .catch((err) => {
        console.log("Error while fetching metadata:", err);
        setNeedMetadata(true);
      });
  }, [address]);

  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salts || !needMetadata) return;

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
  }, [email, salts, renewalBox, isSwissResident, needMetadata]);

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
      // If normal renewal
      // const calls = [
      //   registrationCalls.approve(price),
      //   ...registrationCalls.multiCallRenewal(
      //     selectedDomainsToEncodedArray(selectedDomains),
      //     duration,
      //     metadataHashes,
      //     "0",
      //     discountId
      //   ),
      // ];

      // If free renewal
      const calls = [
        ...registrationCalls.multiCallFreeRenewals(
          selectedDomainsToEncodedArray(selectedDomains)
        ),
      ];

      // NO VAT CAUSE It's free
      // If the user is a Swiss resident, we add the sales tax
      // if (salesTaxRate) {
      //   calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      // }

      if (renewalBox) {
        if (
          erc20AllowanceError ||
          (erc20AllowanceData &&
            erc20AllowanceData["remaining"].low !== UINT_128_MAX &&
            erc20AllowanceData["remaining"].high !== UINT_128_MAX)
        ) {
          calls.unshift(autoRenewalCalls.approve());
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
          calls.unshift(
            autoRenewalCalls.enableRenewal(
              encodedDomain,
              allowance,
              "0x" + (needMetadata ? metadataHashes[index] : metadataHashes[0])
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
    erc20AllowanceData,
    metadataHashes,
    salesTaxRate,
    duration,
    renewalBox,
    erc20AllowanceError,
    discountId,
    needMetadata,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={goBack} />
          <div className="flex flex-col items-start gap-0 self-stretch">
            <p className={styles.legend}>Your renewal</p>
            <h3 className={styles.domain}>Renew Your domain(s)</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            {needMetadata && (
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
            )}
            {needMetadata && (
              <SwissForm
                isSwissResident={isSwissResident}
                onSwissResidentChange={() =>
                  setIsSwissResident(!isSwissResident)
                }
              />
            )}

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
            duration={Number(numberToFixedString(duration / 365))}
            renewalBox={renewalBox}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            customMessage={customMessage}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            renewalBox={renewalBox}
            isArOnforced={isArOnforced}
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
                (emailError && needMetadata) ||
                !areDomainSelected(selectedDomains)
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : invalidBalance
                ? "You don't have enough eth"
                : !areDomainSelected(selectedDomains)
                ? "Select a domain to renew"
                : emailError && needMetadata
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
        closeModal={() => router.push("/identities")}
      />
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default RenewalDiscount;
