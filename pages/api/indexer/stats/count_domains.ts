import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    count: number;
  } | queryError>
) {
  const { query: { since }, } = req;
  const sinceTime = parseInt(since as string) * 1000;
  const { db } = await connectToDatabase();
  const domainCollection = db.collection("domains");

  let root_domains_count: number | undefined;
  await domainCollection.countDocuments({
    "expiry": { "$gte": Math.ceil(Date.now() / 100000) * 100, },
    'creation_date': {
      '$gte': new Date(sinceTime),
    },
    "_chain.valid_to": { "$eq": null },
  }).then((count) => {
    root_domains_count = count;
  });

  res
    .setHeader("cache-control", "max-age=30")
    .status(200)
    .json({
      count: root_domains_count as number,
    });

}
