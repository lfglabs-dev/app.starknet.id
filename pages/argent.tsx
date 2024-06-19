import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";
import DiscountOfferScreen from "../components/discount/discountOfferScreen";

// Create a new discount in utils to create a new discount campaign
import { argentDiscount } from "../utils/discounts/argent";
import RegisterDiscount from "@/components/discount/registerDiscount";
import styles from "../styles/discount.module.css";
import { useAccount, useConnect } from "@starknet-react/core";
import ConnectButton from "@/components/UI/connectButton";
import ArgentIcon from "@/components/UI/iconsComponents/icons/argentIcon";

const Argent: NextPage = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>();
  const [screen, setScreen] = useState<number>(1);
  const [isArgent, setIsArgent] = useState(true);
  const { account } = useAccount();
  const connector = useConnect();

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (timestamp >= argentDiscount.expiry) {
      setScreen(0);
    }
  }, []);

  useEffect(() => {
    if (
      !connector?.connector ||
      !["Argent X", "Argent (mobile)"].includes(connector.connector?.name)
    ) {
      setIsArgent(false);
      return;
    }
    setIsArgent(true);
  }, [connector]);

  function goBack() {
    setScreen(screen - 1);
  }

  const handleSetScreen = (screen: number) => {
    const referralData = {
      sponsor: argentDiscount.sponsor, // the sponsor address
      expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // the current date of expiration + 1 week
    };

    localStorage.setItem("referralData", JSON.stringify(referralData));
    setScreen(screen);
  };

  return (
    <div className={homeStyles.screen}>
      {!isArgent || !account ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-10">
            <ArgentIcon width="150px" color="#FF875B" />
          </div>
          <div className={styles.title}>Connect Argent wallet</div>
          <div className={styles.description}>
            To access this discount, you need to connect an Argent wallet.
          </div>
          {!account ? (
            <div className="flex items-center mt-3">
              <ConnectButton />
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {screen === 0 ? (
            <DiscountEndScreen
              title={`${argentDiscount.name} discount has ended`}
              image={argentDiscount.image}
            />
          ) : null}
          {screen === 1 ? (
            <DiscountOfferScreen
              title={argentDiscount.offer.title}
              desc={argentDiscount.offer.desc}
              image={argentDiscount.offer.image ?? argentDiscount.image}
              setSearchResult={setSearchResult}
              setScreen={handleSetScreen}
              expiry={argentDiscount.expiry}
            />
          ) : null}
          {screen === 2 ? (
            <div className={styles.container}>
              <RegisterDiscount
                domain={searchResult?.name ?? ""}
                duration={argentDiscount.offer.duration}
                discountId={argentDiscount.offer.discountId}
                customMessage={argentDiscount.offer.customMessage}
                goBack={goBack}
                priceInEth={argentDiscount.offer.price}
                mailGroups={[argentDiscount.discountMailGroupId]}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Argent;
