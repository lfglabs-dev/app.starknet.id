import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "twitter-api-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let response;
  const {
    query: { username },
  } = req;
  const client = new Client(process.env.TWITTER_TOKEN as string);
  await client.users
    .findUserByUsername(username as string)
    .then(async (user) => {
      response = await client.users.usersIdFollowing(user?.data?.id as string, {
        max_results: 500,
        "user.fields": ["profile_image_url", "public_metrics", "description"],
      });
      res
        .setHeader("cache-control", "max-age=86400")
        .status(200)
        .json(response.data?.filter((user) => user.name.includes(".stark")));
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}
