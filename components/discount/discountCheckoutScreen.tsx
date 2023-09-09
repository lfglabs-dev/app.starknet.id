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
          mailGroups={[
            process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? "",
            mailGroupId,
          ]} // Second group is the special group for
        />
      </div>
    </div>
  );
};

export default DiscountCheckoutScreen;
