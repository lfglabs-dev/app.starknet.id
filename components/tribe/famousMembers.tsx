import React, { FunctionComponent } from "react";
import styles from "../../styles/jointhetribe.module.css";
import Member from "./member";
import MembersSkeleton from "./membersSkeleton";
import famousTribeMembers from "../../public/tribe/famousTribeMembers.json";

const FamousMembers: FunctionComponent = () => {
  // Twitter call
  // const [famousTribeMembers, setFamousTribeMembers] = useState<Member[]>([]);

  // useEffect(() => {
  //   fetch("/api/twitter/get_famous_members")
  //     .then((res) => res.json())
  //     .then((res: Member[]) => {
  //       setFamousTribeMembers(res);
  //     });
  // }, []);

  return (
    <div className={styles.tribeMembersContainer + " " + styles.famous}>
      {famousTribeMembers?.data?.length === 0 ? (
        <MembersSkeleton />
      ) : (
        famousTribeMembers?.data.map((member, index) => (
          <div key={"famousUser_" + index}>
            <Member member={member} />
          </div>
        ))
      )}
    </div>
  );
};

export default FamousMembers;
