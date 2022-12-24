import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "twitter-api-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
  } = req;
  const client = new Client(process.env.NEXT_PUBLIC_TWITTER_TOKEN as string);
  const response = await client.users.findUsersById({ ids: [id as string] });
  res
    .setHeader("cache-control", "max-age=86400")
    .status(200)
    .json(response.data);
}
