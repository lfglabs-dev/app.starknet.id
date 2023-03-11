import React, { FunctionComponent, useState } from "react";
import Details from "./details";
import DomainTabs from "./domainTabs";
import Register from "./register";

type DomainMenuProps = {
  domain: string;
  isAvailable?: boolean;
};

const DomainMenu: FunctionComponent<DomainMenuProps> = ({
  domain,
  isAvailable,
}) => {
  const [tab, setTab] = useState("one");

  function changeTab(tab: string): void {
    setTab(tab);
  }

  return (
    <div className="ml-5 mr-5 max-w-full min-w-fit-content">
      <DomainTabs changeTab={changeTab} tab={tab} />
      <div className="mt-5 flex justify-center">
        {tab == "one" && <Register isAvailable={isAvailable} domain={domain} />}
        {tab == "two" && <Details domain={domain} />}
      </div>
    </div>
  );
};

export default DomainMenu;
