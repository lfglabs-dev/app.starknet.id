import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import RegisterDiscount from "./registerDiscount";
import ArrowLeftIcon from "../UI/iconsComponents/icons/arrowLeftIcon";
import theme from "../../styles/theme";

type DiscountCheckoutScreenProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  goBack: () => void;
};

const DiscountCheckoutScreen: FunctionComponent<
  DiscountCheckoutScreenProps
> = ({ domain, duration, discountId, customMessage, price, goBack }) => {
  return (
    <div className={styles.container}>
      <div className="flex flex-col gap-8">
        <div className={styles.backArrow} onClick={() => goBack()}>
          <ArrowLeftIcon width="24px" color={theme.palette.secondary.main} />
          <p className="ml-2">Back</p>
        </div>
        <RegisterDiscount
          domain={domain}
          duration={duration}
          discountId={discountId}
          customMessage={customMessage}
          price={price}
          mailGroups={["98125177486837731", "1$_domain_group"]}
        />
      </div>
    </div>
  );
};

export default DiscountCheckoutScreen;
