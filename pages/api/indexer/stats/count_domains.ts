import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    root_domains: number;
    subdomains: number;
  } | queryError>
) {

  const { db } = await connectToDatabase();
  const domainCollection = db.collection("domains");

  let root_domains_count;
  await domainCollection.countDocuments({
    "expiry": { "$gte": Math.ceil(Date.now() / 100000) * 100, },
    "_chain.valid_to": { "$eq": null },
  }).then((count) => {
    root_domains_count = count;
  });


  let subdomains_count;
  await domainCollection.countDocuments({
    "expiry": { "$eq": null, },
    "_chain.valid_to": { "$eq": null },
  }).then((count) => {
    subdomains_count = count;
  });

  res
    .setHeader("cache-control", "max-age=30")
    .status(200)
    .json({
      root_domains: root_domains_count as any,
      subdomains: subdomains_count as any
    });

}
