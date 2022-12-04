import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from 'mongodb';

type FullId = {
  id: string,
  domain?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    full_ids: Array<FullId>;
  }>) {

  const { query: { addr }, } = req;
  const full_ids: Array<FullId> = [];
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
      if (domainDoc) {
        full_ids.push({ id: tokenId, domain: domainDoc.domain });
      } else {
        full_ids.push({ id: tokenId });
      }
    });
  }
  res.status(200).json({ full_ids: full_ids })
}