import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    count: number;
  } | queryError>
) {

  const { db } = await connectToDatabase();
  const domainCollection = db.collection("starknet_ids");

  await domainCollection.countDocuments({
    "_chain.valid_to": { "$eq": null },
  }).then((count) => {
    res
      .setHeader("cache-control", "max-age=30")
      .status(200)
      .json({
        count: count
      });
  });

}
