import React, { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/components/newsletter.module.css";
import Button from "../components/UI/button";
import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { isValidEmail } from "../utils/stringService";
import TextField from "../components/UI/textField";

const NewsletterPage: NextPage = () => {
  const { address } = useAccount();
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  const submitHandler = () => {
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/newsletter_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        address: address || null,
      }),
    })
      .then((res) =>
        res.json().then(() => window.open("/newsletter/confirm", "_self"))
      )
      .catch((err) => {
        setError("This email is already registered.");
        console.log("Error on registering to email:", err);
      });
  };

  function changeEmail(value: string): void {
    setEmail(value);
    setIsButtonDisabled(!isValidEmail(value));
  }

  return (
    <div className={styles.page}>
      <div className={styles.balloon}>
        <Image src="/visuals/balloon.webp" alt="hot-air balloon" fill />
      </div>
      <div className={styles.coconut}>
        <Image src="/visuals/coconut.webp" alt="coconut" fill />
      </div>
      <div className={styles.starknet}>
        <Image src="/icons/starknet.svg" alt="starknet" fill />
      </div>
      <div className={styles.lilLeaf1}>
        <Image src="/leaves/new/lilLeaf01.svg" alt="leaf" fill />
      </div>
      <div className={styles.lilLeaf2}>
        <Image src="/leaves/new/lilLeaf01.svg" alt="leaf" fill />
      </div>
      <div className={styles.lilLeaf3}>
        <Image src="/leaves/new/lilLeaf02.svg" alt="leaf" fill />
      </div>
      <div className={styles.tree1}>
        <Image src="/visuals/coconutTree1.webp" alt="coconut tree" fill />
      </div>
      <div className={styles.tree2}>
        <Image src="/visuals/coconutTree2.webp" alt="coconut tree" fill />
      </div>
      <p className={styles.subtitle}>Newsletter</p>
      <h1 className={styles.title}>
        The best <strong>Starknet opportunities</strong> in your inbox
      </h1>
      <p className={styles.description}>
        Every two weeks, we send you exclusive insights into airdrops,
        opportunities, and the latest news on Starknet.
      </p>
      <section className={styles.form}>
        <TextField
          helperText="Your email stays private with us, always."
          value={email}
          label="Your email address"
          onChange={(e) => changeEmail(e.target.value)}
          color="secondary"
          error={Boolean(error)}
          errorMessage={error ?? "Please enter a valid email address"}
          type="email"
        />
        <div className="w-fit block mx-auto mt-4">
          <Button onClick={submitHandler} disabled={isButtonDisabled}>
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NewsletterPage;
