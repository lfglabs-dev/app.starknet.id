import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";
import DiscountOfferScreen from "../components/discount/discountOfferScreen";
import DiscountUpsellScreen from "../components/discount/discountUpsellScreen";
import DiscountCheckoutScreen from "../components/discount/discountCheckoutScreen";

// Create a new discount in utils to create a new discount campaign
import { quantumLeapDiscount } from "../utils/discounts/quantumLeap";

const QuantumLeap: NextPage = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>();
  const [isUpselled, setIsUpselled] = useState<boolean>(true);
  const [screen, setScreen] = useState<number>(1);

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (timestamp >= quantumLeapDiscount.expiry) {
      setScreen(0);
    }
  }, []);

  function onUpsellChoice(isUpselled: boolean) {
    setIsUpselled(isUpselled);
    setScreen(3);
  }

  function getDuration() {
    return isUpselled
      ? quantumLeapDiscount.upsell.duration
      : quantumLeapDiscount.offer.duration;
  }

  function getDiscountId() {
    return isUpselled
      ? quantumLeapDiscount.upsell.discountId
      : quantumLeapDiscount.offer.discountId;
  }

  function getCustomMessage() {
    return isUpselled
      ? quantumLeapDiscount.upsell.customMessage
      : quantumLeapDiscount.offer.customMessage;
  }

  function getPrice() {
    return isUpselled
      ? quantumLeapDiscount.upsell.price
      : quantumLeapDiscount.offer.price;
  }

  function goBack() {
    setScreen(screen - 1);
  }

  return (
    <div className={homeStyles.screen}>
      {screen === 0 ? (
        <DiscountEndScreen
          title={`${quantumLeapDiscount.name} discount has ended`}
          image={quantumLeapDiscount.image}
        />
      ) : null}
      {screen === 1 ? (
        <DiscountOfferScreen
          title={quantumLeapDiscount.offer.title}
          desc={quantumLeapDiscount.offer.desc}
          image={quantumLeapDiscount.offer.image ?? quantumLeapDiscount.image}
          setSearchResult={setSearchResult}
          setScreen={setScreen}
          expiry={quantumLeapDiscount.expiry}
        />
      ) : null}
      {screen === 2 ? (
        <DiscountUpsellScreen
          title={quantumLeapDiscount.upsell.title}
          desc={quantumLeapDiscount.upsell.desc}
          image={quantumLeapDiscount.upsell.image ?? quantumLeapDiscount.image}
          goBack={goBack}
          expiry={quantumLeapDiscount.expiry}
          onUpsellChoice={onUpsellChoice}
        />
      ) : null}
      {screen === 3 ? (
        <DiscountCheckoutScreen
          domain={searchResult?.name ?? ""}
          duration={getDuration()}
          discountId={getDiscountId()}
          customMessage={getCustomMessage()}
          price={getPrice()}
          goBack={goBack}
        />
      ) : null}
    </div>
  );
};

export default QuantumLeap;
