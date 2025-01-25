import React, { NextPage } from "next";
import styles from "../../styles/components/newsletter.module.css";
import Button from "../../components/UI/button";

const NewsletterConfirm: NextPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.confirmContainer}>
        <div>
          <img src="/visuals/hotAirBalloon.svg" alt="hot air balloon" className={styles.balloon}/>
          <img src="/visuals/coconut.svg" alt="decorative coconut" className={styles.coconut} />
+         <img src="/visuals/leftTree.svg" alt="decorative left tree" className={styles.tree1}/>
+         <img src="/visuals/rightTree.svg" alt="decorative right tree" className={styles.tree2}/>
        </div>
        <div className={styles.confirmContent}>
          <p className={`${styles.last} mb-2`}>One last thing...</p>
          <p className={`${styles.last} mb-2 ${styles.letter}`}>Newsletter</p>
          <h1 className={styles.title}>
              You&apos;re <strong>subscribed !</strong>
          </h1>
          <p className={`${styles.paragraph} mt-4`}>
              No noise, just news.Almost there! To ensure you receive our
              newsletters, please check your email to confirm your subscription. Don&apos;t let vital
              updates slip through – add us to your trusted senders
          </p>
          <div className="mt-12">
              <Button variation="dark" onClick={() => window.open("mailto:", "_self")}>
                Open your email
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterConfirm;
