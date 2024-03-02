import React, { NextPage } from "next";
import styles from "../../styles/components/newsletter.module.css";
import Button from "../../components/UI/button";

const NewsletterConfirm: NextPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.confirmContainer}>
        <div className={styles.bannerContainer}>
          <img
            src="https://storage.googleapis.com/support-kms-prod/OugFYQGklDvyRbnHYclDAjGPqARIkc6XTJ2W"
            alt="How to remove email from spam"
            className={styles.confirmBanner}
          />
        </div>
        <div className={styles.confirmContent}>
          <div>
            <p className="mb-2">One last thing...</p>
            <h1 className={styles.title}>
              You&apos;re <strong>subscribed !</strong>
            </h1>
            <p className="mt-4">
              Almost there! To ensure you receive our newsletters, please check
              your email to confirm your subscription. Don't let vital updates
              slip through – add us to your trusted senders
            </p>
            <div className="w-[244px] mt-12">
              <Button onClick={() => window.open("mailto:", "_self")}>
                Open your email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterConfirm;
