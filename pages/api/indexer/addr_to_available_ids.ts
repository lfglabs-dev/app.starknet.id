import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from 'mongodb';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    ids: Array<string>;
  }>) {

  const { query: { addr }, } = req;
  const ids: Array<string> = [];
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_LINK as string, { serverApi: ServerApiVersion.v1 });
  await client.connect();
  const db = client.db("starknet_id");
  const documents = db.collection("starknet_ids").find({ "owner": addr, "_chain.valid_to": null });
  const domains = db.collection("domains");
  for (const doc of await documents.toArray()) {
    const tokenId: string = doc.token_id;
    await domains.findOne({
      "token_id": tokenId,
      "_chain.valid_to": null,
    }).then((domainDoc) => {
      if (!domainDoc)
        ids.push(tokenId);
    });
  }
  res.status(200).json({ "ids": ids })
}