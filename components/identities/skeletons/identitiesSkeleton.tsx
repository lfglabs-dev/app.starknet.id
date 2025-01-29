import {Skeleton} from "@mui/material";
import React, {FunctionComponent} from "react";
import styles from "../../../styles/components/identitiesV1.module.css";

const IdentitiesSkeleton: FunctionComponent = () => {
   return (
      <div className="pt-20">
         <div className={styles.identitiesSkeleton}>
            <Skeleton variant="rounded" width={300} height={546} className=""/>
            <Skeleton variant="rounded" width={598} height={346} className="mt-20 hidden md:flex"/>
            <Skeleton variant="rounded" width={398} height={246} className="mt-32 hidden lg:flex"/>
         </div>
      </div>
   );
};

export default IdentitiesSkeleton;
