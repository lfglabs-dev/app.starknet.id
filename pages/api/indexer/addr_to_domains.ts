import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from 'nextjs-cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    domains: Array<string>;
  }>) {
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200,
  });
  const { query: { addr }, } = req;
  const _domains: Array<string> = [];
  const { db } = await connectToDatabase();
  const documents = db.collection("starknet_ids").find({ "owner": addr, "_chain.valid_to": null });
  const domains = db.collection("domains");
  for (const doc of await documents.toArray()) {
    const tokenId: string = doc.token_id;
    await domains.findOne({
      "token_id": tokenId,
      "_chain.valid_to": null,
    }).then((domainDoc) => {
      if (domainDoc) {
        _domains.push(domainDoc.domain);
      }
    });
  }
  res.setHeader("cache-control", "max-age=30").status(200).json({ domains: _domains })

}