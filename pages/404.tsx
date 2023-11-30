import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { CDNImg } from "../components/cdn/image";

const NotFound: NextPage = () => {
  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className="flex flex-col items-center justify-center h-full">
          <CDNImg
            src="/visuals/errorIllu.webp"
            height={300}
            width={300}
            alt="error illustration"
          />
          <div className="text-center">
            <h1 className="title">404 - Page Not Found</h1>
            <p className="mt-2">The page you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
