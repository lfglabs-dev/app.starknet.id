import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/discount.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";

import { freeRegistration } from "../utils/discounts/freeRegistration";
import FreeRegisterPresentation from "@/components/discount/freeRegisterPresentation";
import FreeRegisterCheckout from "@/components/discount/freeRegisterCheckout";

const FreeRegistration: NextPage = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>();
  const [screen, setScreen] = useState<number>(1);

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (timestamp >= freeRegistration.expiry) setScreen(0);
  }, []);

  const goBack = () => setScreen(screen - 1);

  return (
    <div className={homeStyles.screen}>
      {screen === 0 ? (
        <DiscountEndScreen
          title={`${freeRegistration.name} discount has ended`}
          image={freeRegistration.image}
        />
      ) : null}
      {screen === 1 ? (
        <FreeRegisterPresentation
          title={freeRegistration.offer.title}
          desc={freeRegistration.offer.desc}
          image={freeRegistration.offer.image ?? freeRegistration.image}
          setSearchResult={setSearchResult}
          setScreen={setScreen}
          expiry={freeRegistration.expiry}
        />
      ) : null}
      {screen === 2 ? (
        <div className={styles.container}>
          <FreeRegisterCheckout
            domain={searchResult?.name ?? ""}
            duration={freeRegistration.offer.duration}
            customMessage={freeRegistration.offer.customMessage}
            goBack={goBack}
            couponCode={freeRegistration.offer.couponCode}
            couponHelper={freeRegistration.offer.couponHelper}
            banner={freeRegistration.image}
          />
        </div>
      ) : null}
    </div>
  );
};

export default FreeRegistration;
