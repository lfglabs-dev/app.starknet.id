import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { username },
  } = req;

  const appHeaders = new Headers();
  appHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  appHeaders.append("Authorization", `Bearer ${process.env.NEXT_PUBLIC_TRIBE_TWITTER_TOKEN}`);

  const initApp = {
    method: "GET",
    headers: appHeaders
  }

  const resp = (await (await fetch(`https://api.twitter.com/2/users/by/username/${username}`, initApp)).json());

  if (resp.errors) if (resp.errors[0]?.title === 'Not Found Error') return res
  .setHeader("cache-control", "max-age=86400")
  .status(200)
  .json({});

  const user = resp.data

  if (!user) {
    return res
    .setHeader("cache-control", "max-age=86400")
    .status(200)
    .json({
      error: 'Invalid Request'
    });
  }

  const userId = user.id;
  const { db } = await connectToDatabase();
  const tribeFollowers = db.collection('tribe_followers')
  
  const followers = await tribeFollowers.find({ following: userId }).toArray();
  const following = await tribeFollowers.find({ follower: userId }).toArray();

  followers.length = 12;
  following.length = 12;

  const followersUsers = (await (await fetch(`https://api.twitter.com/1.1/users/lookup.json?user_id=${followers.map((user: any) => user.follower).join(",")}`, initApp)).json());
  const followingUsers = (await (await fetch(`https://api.twitter.com/1.1/users/lookup.json?user_id=${following.map((user: any) => user.following).join(",")}`, initApp)).json());
  res
  .setHeader("cache-control", "max-age=86400")
  .status(200)
  .json({
    user: user,
    followers: followersUsers,
    following: followingUsers
  });
}
