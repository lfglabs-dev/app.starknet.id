import React from "react";
import { NextPage } from "next";
import { useAccount } from "@starknet-react/core";

const Confirmation: NextPage = () => {
  const { address } = useAccount();

  return <></>;
};

export default Confirmation;
