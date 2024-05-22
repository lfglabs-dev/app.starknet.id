import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import RegisterDiscount, { GetCustomCalls } from "./registerDiscount";

type DiscountCheckoutScreenProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  goBack: () => void;
  mailGroupId: string;
  couponCode?: boolean;
  couponHelper?: string;
  banner?: string;
  getCustomCalls?: GetCustomCalls;
};

const DiscountCheckoutScreen: FunctionComponent<
  DiscountCheckoutScreenProps
> = ({
  domain,
  duration,
  discountId,
  customMessage,
  price,
  goBack,
  mailGroupId,
  couponCode,
  couponHelper,
  banner,
  getCustomCalls,
}) => {
  return (
    <div className={styles.container}>
      <RegisterDiscount
        domain={domain}
        duration={duration}
        discountId={discountId}
        customMessage={customMessage}
        priceInEth={price}
        mailGroups={[
          process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? "",
          mailGroupId,
        ]} // Second group is the special group for discount group
        goBack={goBack}
        couponCode={couponCode}
        couponHelper={couponHelper}
        banner={banner}
        getCustomCalls={getCustomCalls}
      />
    </div>
  );
};

export default DiscountCheckoutScreen;
