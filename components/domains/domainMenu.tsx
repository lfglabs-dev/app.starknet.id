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
    <div>
      <DomainTabs changeTab={changeTab} tab={tab} />
      <div className="mt-5 flex justify-center">
        {tab == "one" && <Register isAvailable={isAvailable} domain={domain} />}
        {tab == "two" && <Details domain={domain} isAvailable={isAvailable} />}
      </div>
    </div>
  );
};

export default DomainMenu;
