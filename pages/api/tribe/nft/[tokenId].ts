import type { NextApiRequest, NextApiResponse } from "next";
import Router from "next/router";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { tokenId },
  } = req;

  const imageURL = process.env.NEXT_PUBLIC_WEBSITE_URL as string;

  switch (tokenId) {
    case '0.json':
      res
      .setHeader("cache-control", "max-age=86400")
      .status(200)
      .json({
        name:"Silver tribe member",
        description:"This token is the proof that you are a member of the tribe",
        image:`${imageURL}/tribe/nft/1.png`
      });
    break;
    case '1.json':
      res
      .setHeader("cache-control", "max-age=86400")
      .status(200)
      .json({
        name:"Silver tribe member",
        description:"This token is the proof that you were on the first 5000 members of the tribe",
        image:`${imageURL}/tribe/nft/2.png`
      });
    break;
    case '2.json':
      res
      .setHeader("cache-control", "max-age=86400")
      .status(200)
      .json({
        name:"Gold tribe member",
        description:"This token is the proof that you were one of the first 2000 members of the tribe",
        image:`${imageURL}/tribe/nft/3.png`
      });
    break;
  }
}
