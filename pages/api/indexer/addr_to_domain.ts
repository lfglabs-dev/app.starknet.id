import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from 'mongodb';

type Data = { domain: string, domain_expiry: number } | { error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>) {

    const { query: { addr }, } = req;
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_LINK as string, { serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db("starknet_id");
    await db.collection("domains").findOne(
        {
            "addr": addr,
            "rev_addr": addr,
            "_chain.valid_to": null,
        }
    ).then((domainDoc) => {
        res.status(200).json(domainDoc
            ? { "domain": domainDoc.domain, "domain_expiry": domainDoc.expiry }
            : { "error": "no domain found" }
        )
    });

}