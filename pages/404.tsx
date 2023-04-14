import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const NotFound: NextPage = () => {
  return (
    <div className={styles.screen}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="title">404 - Page Not Found</h1>
          <p className="mt-2">The page you are looking for does not exist.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
