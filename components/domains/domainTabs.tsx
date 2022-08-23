import React, { FunctionComponent } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

type DomainTabsProps = {
  changeTab: (tab: string) => void;
  tab: string;
};

const DomainTabs: FunctionComponent<DomainTabsProps> = ({ changeTab, tab }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    changeTab(newValue);
  };

  return (
    <Box
      sx={{
        marginTop: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Tabs
        textColor="secondary"
        indicatorColor="secondary"
        value={tab}
        onChange={handleChange}
      >
        <Tab value="one" label="Register" />
        <Tab value="two" label="Details" />
        <Tab value="three" label="Subdomain" />
      </Tabs>
    </Box>
  );
};

export default DomainTabs;
