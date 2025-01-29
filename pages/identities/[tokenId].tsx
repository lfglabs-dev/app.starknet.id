import React from "react";
import AvailableIdentities from "@/components/identities/availableIdentities";
import homeStyles from "../../styles/Home.module.css";
import {NextPage} from "next";
import {useRouter} from "next/router";
import BackButton from "@/components/UI/backButton";

const TokenIdPage: NextPage = () => {
   const router = useRouter();
   const tokenId: string = router.query.tokenId as string;
   return (
      <div className={homeStyles.wrapperScreen}>
         <div className="mt-[8rem]">
            <AvailableIdentities tokenId={tokenId} />
         </div>
      </div>
   );
};

export default TokenIdPage;
