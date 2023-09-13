import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import RegisterDiscount from "./registerDiscount";

type DiscountCheckoutScreenProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  goBack: () => void;
  mailGroupId: string;
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
}) => {
  return (
    <div className={styles.container}>
      <RegisterDiscount
        domain={domain}
        duration={duration}
        discountId={discountId}
        customMessage={customMessage}
        price={price}
        mailGroups={[
          process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? "",
          mailGroupId,
        ]} // Second group is the special group for discount group
        goBack={goBack}
      />
    </div>
  );
};

export default DiscountCheckoutScreen;
