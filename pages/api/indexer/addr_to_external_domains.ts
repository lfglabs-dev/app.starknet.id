import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExternalDomains>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });

  const addr = req.query.addr as string;
  const domainsList: string[] = [];
  const { db } = await connectToDatabase();
  const documents = db
    .collection("subdomains")
    .find({ addr: addr, "_chain.valid_to": null });
  for (const doc of await documents.toArray()) {
    domainsList.push(doc.domain);
  }

  res
    .setHeader("cache-control", "max-age=30")
    .status(200)
    .json({ domains: domainsList });
}
