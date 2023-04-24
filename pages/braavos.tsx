import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Button from "../components/UI/button";
import { useRouter } from "next/router";

const Braavos: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.screen}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center flex flex-col justify-center items-center">
          <h1 className="title">The shield campaign has ended</h1>
          <img width={500} src="/braavos/shields.webp" />
          <div className="max-w-lg">
            <Button onClick={() => router.push("/")}>Back to the app</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Braavos;
