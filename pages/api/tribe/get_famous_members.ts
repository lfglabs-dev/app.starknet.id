import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import famousTribeMemberIDs from "../../../public/datas/famousTribeMemberIDs.json";
export default async function handler(
  res: NextApiResponse
) {
  const appHeaders = new Headers();
  appHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  appHeaders.append("Authorization", `Bearer ${process.env.NEXT_PUBLIC_TRIBE_TWITTER_TOKEN}`);

  const initApp = {
    method: "GET",
    headers: appHeaders
  }

  const { db } = await connectToDatabase();
  const tribeFamousMembers = db.collection('tribe_famous_members')
  let cachedMembers = await tribeFamousMembers.find({ id: { $in: famousTribeMemberIDs } }).toArray()
  
  // If there is one of the following problem, we will refresh the cache :
  // - The cache is empty
  // - The cache is older than 1 day
  // - The cache is not complete
  const expiryDelay = 1000 * 60 * 60 * 24;
  if (cachedMembers.length === 0 || cachedMembers.length !== famousTribeMemberIDs.length || cachedMembers[0].createdAt < Date.now() - expiryDelay) {
    const members = (await (await fetch(`https://api.twitter.com/1.1/users/lookup.json?user_id=${famousTribeMemberIDs.join(",")}`, initApp)).json());
    tribeFamousMembers.deleteMany({});
    const newMembers = members.map((member: any) => ({ ...member, createdAt: Date.now() }))
    tribeFamousMembers.insertMany(newMembers);
    cachedMembers = newMembers;
  }

  res
  .setHeader("cache-control", "max-age=86400")
  .status(200)
  .json({
    cachedMembers
  });
}
