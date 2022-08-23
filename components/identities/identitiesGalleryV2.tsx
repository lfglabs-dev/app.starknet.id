/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent } from "react";
import styles from "../styles/components/identitiesV2.module.css";

const IdentitiesGallery: FunctionComponent = () => {
  return (
    <div className={styles.slider}>
      <div className={styles.slide}>
        <div className={styles["slide-container"]}>
          <h2 className={styles["slide-title"]}>Q1 - 2021</h2>
          <div className={styles["slide-description"]}>
            <ul className={styles.ul}>
              <li className={styles.il}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </li>
              <li className={styles.il}>
                Nunc blandit justo ac dolor lobortis suscipit.
              </li>
              <li className={styles.il}>Et tincidunt lectus porta sit amet.</li>
              <li className={styles.il}>
                Nulla dignissim ligula nec faucibus feugiat.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.slide}>
        <div className={styles["slide-container"]}>
          <h2 className={styles["slide-title"]}>Q2 - 2021</h2>
          <div className={styles["slide-description"]}>
            <ul className={styles.ul}>
              <li className={styles.il}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </li>
              <li className={styles.il}>
                Nunc blandit justo ac dolor lobortis suscipit.
              </li>
              <li className={styles.il}>Et tincidunt lectus porta sit amet.</li>
              <li className={styles.il}>
                Nulla dignissim ligula nec faucibus feugiat.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.slide}>
        <div className={styles["slide-container"]}>
          <h2 className={styles["slide-title"]}>Q3 - 2021</h2>
          <div className={styles["slide-description"]}>
            <ul className={styles.ul}>
              <li className={styles.il}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </li>
              <li className={styles.il}>
                Nunc blandit justo ac dolor lobortis suscipit.
              </li>
              <li className={styles.il}>Et tincidunt lectus porta sit amet.</li>
              <li className={styles.il}>
                Nulla dignissim ligula nec faucibus feugiat.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentitiesGallery;
