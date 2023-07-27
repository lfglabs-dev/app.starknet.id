import { NextApiRequest, NextApiResponse } from "next";
import famousTribeMemberIDs from "../../../public/tribe/famousTribeMemberIDs.json";

// I use this cause twitter SDK don't work for some reason
async function fetchTwitterData(): Promise<Member[] | Error> {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.TWITTER_TOKEN}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const params = new URLSearchParams({ ids: famousTribeMemberIDs.join(",") });

  const response: Member[] | Error = await fetch(
    `https://api.twitter.com/2/users/?${params}&user.fields=profile_image_url,description,public_metrics`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => result.data as Member[])
    .catch((error) => new Error(error));

  return response;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Member[] | Error>
) {
  const twitterData = await fetchTwitterData();

  res.status(200).json(twitterData);
}
