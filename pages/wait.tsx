import { Router } from "@mui/icons-material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import styles from "../styles/wait.module.css";

export const countDownDate = new Date("Nov 16, 2022 11:29:35").getTime();

const Wait: NextPage = () => {
  const [dateToShow, setDateToShow] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const now = new Date().getTime();
    const isMainnetDatePassed = Boolean(now - countDownDate > 0);

    if (isMainnetDatePassed) {
      router.push("/");
    }
  }, [dateToShow]);

  // Set the date we're counting down to

  useEffect(() => {
    window.setInterval(function () {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setDateToShow([days, hours, minutes, seconds]);
    }, 1000);
  }, [dateToShow]);

  // Update the count down every 1 second

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      {dateToShow.length != 0 ? (
        <div className={styles.container}>
          <p className={styles.legend}>Mainnet is coming in </p>
          <h1
            className={styles.title}
          >{`${dateToShow[0]}d ${dateToShow[1]}h ${dateToShow[2]}m ${dateToShow[3]}s`}</h1>
        </div>
      ) : (
        <>
          <ThreeDots
            height="25"
            width="80"
            radius="9"
            color="#19AA6E"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </>
      )}
      <div className={styles.thirdLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.fourthLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
    </div>
  );
};

export default Wait;
