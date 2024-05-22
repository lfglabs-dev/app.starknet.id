import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";
import DiscountCheckoutScreen from "../components/discount/discountCheckoutScreen";

// Create a new discount in utils to create a new discount campaign
import { domainGift } from "../utils/discounts/domainGift";
import DiscountOfferScreenVariant from "@/components/discount/discountOfferScreenVariant";

const DomainGift: NextPage = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>();
  const [screen, setScreen] = useState<number>(1);

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (timestamp >= domainGift.expiry) setScreen(0);
  }, []);

  function goBack() {
    setScreen(screen - 1);
  }

  return (
    <div className={homeStyles.screen}>
      {screen === 0 ? (
        <DiscountEndScreen
          title={`${domainGift.name} discount has ended`}
          image={domainGift.image}
        />
      ) : null}
      {screen === 1 ? (
        <DiscountOfferScreenVariant
          title={domainGift.offer.title}
          desc={domainGift.offer.desc}
          image={domainGift.offer.image ?? domainGift.image}
          setSearchResult={setSearchResult}
          setScreen={setScreen}
          expiry={domainGift.expiry}
        />
      ) : null}
      {screen === 2 ? (
        <DiscountCheckoutScreen
          domain={searchResult?.name ?? ""}
          duration={domainGift.offer.duration}
          discountId={domainGift.offer.discountId}
          customMessage={domainGift.offer.customMessage}
          price={domainGift.offer.price}
          goBack={goBack}
          mailGroupId={domainGift.discountMailGroupId}
          couponCode={domainGift.offer.couponCode}
          couponHelper={domainGift.offer.couponHelper}
          banner={domainGift.image}
        />
      ) : null}
    </div>
  );
};

export default DomainGift;
