import React, { FunctionComponent } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { cleanUsername } from "../../utils/stringService";
import InputAction from "../UI/inputAction";
import Member from "./member";
import styles from "../../styles/jointhetribe.module.css";
import MembersSkeleton from "./membersSkeleton";

const SearchMembers: FunctionComponent = () => {
  const [username, setUsername] = useState<string>("");
  const [loadingState, setLoadingState] = useState(false);
  const [wasSearch, setWasSearch] = useState(false);

  const [followingTribeMembers, setFollowingTribeMembers] = useState<
    Member[] | undefined
  >();

  function onSearch(username: string): void {
    setLoadingState(true);
    setWasSearch(true);
    setUsername(cleanUsername(username));
  }

  useEffect(() => {
    if (username) {
      fetch(`/api/twitter/get_user_following?username=${username}`)
        .then((response) => response.json())
        .then((data) => {
          setFollowingTribeMembers(data);
          setLoadingState(false);
        })
        .catch(() => {
          setLoadingState(false);
        });
    }
  }, [username]);

  return (
    <div
      id="me-and-the-tribe"
      className="flex justify-center flex-col items-center"
    >
      <InputAction
        placeholder="@Twitter username"
        buttonName="show me"
        onClick={onSearch}
      />
      {loadingState ? (
        <MembersSkeleton />
      ) : followingTribeMembers && followingTribeMembers.length > 0 ? (
        <div className={styles.tribeMembersContainer + " " + styles.famous}>
          {followingTribeMembers?.map((member, index) => (
            <div key={`member_${index}`}>
              <Member member={member} />
            </div>
          ))}
        </div>
      ) : followingTribeMembers && followingTribeMembers.length === 0 ? (
        <div className="mt-10 max-w-lg text-center">
          You don&apos;t have any friends in the tribe yet.
        </div>
      ) : wasSearch ? (
        <div className="mt-10 max-w-lg text-center">
          An error occurred while trying to fetch your Tribe friends. Please try
          another name.
        </div>
      ) : null}
    </div>
  );
};

export default SearchMembers;
