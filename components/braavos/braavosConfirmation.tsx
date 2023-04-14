import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/braavos.module.css";
import Button from "../UI/button";
import { useRouter } from "next/router";

type BraavosConfirmationProps = {
  title: string;
  imageSrc: string;
  confirmationText: ReactNode;
};

const BraavosConfirmation: FunctionComponent<BraavosConfirmationProps> = ({
  title,
  imageSrc,
  confirmationText,
}) => {
  const router = useRouter();
  return (
    <>
      <div className={styles.discountContainer}>
        <div className={styles.registerContainer}>
          <h1 className={styles.titleRegister}>{title}</h1>

          <div className="max-w-md">
            {confirmationText}
            <Button onClick={() => router.push("/identities")}>
              See my identities
            </Button>
          </div>
        </div>
        <div className={styles.discountBuyImageContainer}>
          <img className={styles.discountBuyImage} src={imageSrc} />
        </div>
      </div>
    </>
  );
};

export default BraavosConfirmation;
