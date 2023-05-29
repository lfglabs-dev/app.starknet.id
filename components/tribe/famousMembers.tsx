import React, { FunctionComponent, useEffect } from "react";
import { useState } from "react";
import styles from "../../styles/jointhetribe.module.css";
import Member from "./member";
import MembersSkeleton from "./membersSkeleton";

const FamousMembers: FunctionComponent = () => {
  const [famousTribeMembers, setFamousTribeMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/twitter/get_famous_members")
      .then((res) => res.json())
      .then((res: Member[]) => {
        setFamousTribeMembers(res);
      });
  }, []);

  return (
    <div className={styles.tribeMembersContainer + " " + styles.famous}>
      {famousTribeMembers.length === 0 ? (
        <MembersSkeleton />
      ) : (
        famousTribeMembers?.map((member, index) => (
          <div key={"famousUser_" + index}>
            <Member member={member} />
          </div>
        ))
      )}
    </div>
  );
};

export default FamousMembers;
