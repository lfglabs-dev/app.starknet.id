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
import { utils } from "starknetid.js";
import {
  getDomainWithStark,
  isHexString,
  isValidEmail,
} from "../../utils/stringService";
import {
  gweiToEth,
  hexToDecimal,
  numberToFixedString,
} from "../../utils/feltService";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { Abi, Call } from "starknet";
import { posthog } from "posthog-js";
import TxConfirmationModal from "../UI/txConfirmationModal";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import { Divider } from "@mui/material";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import RegisterSummary from "../domains/registerSummary";
import salesTax from "sales-tax";
import Wallets from "../UI/wallets";
import registerCalls from "../../utils/registerCalls";

type RegisterDiscountProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
};

const RegisterDiscount: FunctionComponent<RegisterDiscountProps> = ({
  domain,
  duration,
  discountId,
  customMessage,
  price,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { contract: etherContract } = useEtherContract();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [termsBox, setTermsBox] = useState<boolean>(true);
  // const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [sponsor, setSponsor] = useState<string>("0");

  const { account, address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "balanceOf",
      args: [address],
    });
  const { writeAsync: execute, data: registerData } = useContractWrite({
    // calls: renewalBox
    //   ? callData.concat(registerCalls.renewal(encodedDomain, price))
    //   : callData,
    calls: callData,
  });
  const hasMainDomain = !useDisplayName(address ?? "", false).startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { addTransaction } = useTransactionManager();

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("0");
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

  useEffect(() => {
    if (address) {
      setTargetAddress(address);
    }
  }, [address]);

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
  }, [domain]);

  // Set mulitcalls
  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (
      !hasMainDomain &&
      hexToDecimal(address) === hexToDecimal(targetAddress)
    ) {
      setCallData([
        registerCalls.approve(price),
        registerCalls.buy_discounted(
          encodedDomain,
          newTokenId,
          targetAddress,
          sponsor,
          duration
        ),
        registerCalls.addressToDomain(encodedDomain),
      ]);
    } else if (
      hasMainDomain ||
      (!hasMainDomain && hexToDecimal(address) != hexToDecimal(targetAddress))
    ) {
      setCallData([
        registerCalls.approve(price),
        registerCalls.buy_discounted(
          encodedDomain,
          newTokenId,
          targetAddress,
          discountId,
          duration
        ),
      ]);
    }
  }, [duration, targetAddress, price, domain, hasMainDomain, address, sponsor]);

  useEffect(() => {
    if (!registerData?.transaction_hash) return;
    posthog?.capture("register");
    addTransaction({ hash: registerData?.transaction_hash ?? "" });
    setIsTxModalOpen(true);
  }, [registerData]);

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
  }

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  useEffect(() => {
    if (isUsResident) {
      salesTax.getSalesTax("US", usState).then((tax) => {
        setSalesTaxRate(tax.rate);
        console.log(tax.rate);
      });
    }
  }, [isUsResident, usState]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <div className="flex flex-col items-start gap-4 self-stretch">
            <p className={styles.legend}>Your registration</p>
            <h3 className={styles.domain}>{getDomainWithStark(domain)}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            <TextField
              helperText="Please understand that entering your email is not mandatory to register a domain, we won't share your email with anyone. We'll use it only to inform you about your domain and our news."
              label="Email address"
              value={email}
              onChange={(e) => changeEmail(e.target.value)}
              color="secondary"
              error={emailError}
              errorMessage={"Please enter a valid email address"}
            />
            {/* <UsForm
              isUsResident={isUsResident}
              onUsResidentChange={() => setIsUsResident(!isUsResident)}
              usState={usState}
              changeUsState={(value) => setUsState(value)}
            /> */}
            <TextField
              helperText="The Starknet address the domain will resolve to."
              label="Target address"
              value={targetAddress ?? "0x.."}
              onChange={(e) => changeAddress(e.target.value)}
              color="secondary"
              required
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={price}
            duration={Number(numberToFixedString(duration / 365))}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isUsResident={isUsResident}
            isUsdPriceDisplayed={false}
            customMessage={customMessage}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            // onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            // renewalBox={renewalBox}
          />
          {address ? (
            <Button
              onClick={() =>
                execute().then(() =>
                  setDomainsMinting((prev) =>
                    new Map(prev).set(encodedDomain.toString(), true)
                  )
                )
              }
              disabled={
                (domainsMinting.get(encodedDomain) as boolean) ||
                !account ||
                !duration ||
                !targetAddress ||
                invalidBalance ||
                !termsBox ||
                (isUsResident && !usState)
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : isUsResident && !usState
                ? "We need your US State"
                : invalidBalance
                ? "You don't have enough eth"
                : "Register my domain"}
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
        txHash={registerData?.transaction_hash}
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

export default RegisterDiscount;
