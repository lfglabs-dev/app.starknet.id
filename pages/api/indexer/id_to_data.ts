import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from 'mongodb';

type Data = {
    domain: string,
    addr?: string,
    domain_expiry: number | null,
    is_owner_main: boolean
} | { "error": string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>) {

    const { query: { id }, } = req;
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_LINK as string, { serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db("starknet_id");
    const domainCollection = db.collection("domains");
    let domain: string | undefined;
    let addr: string | undefined;
    let expiry: number | null;
    await domainCollection.findOne({ "token_id": id, "_chain.valid_to": null })
        .then((doc) => {
            if (doc) {
                domain = doc.domain;
                addr = doc.addr;
                expiry = doc.expiry;
            } else {
                domain = undefined;
            }
        });

    let owner: string | undefined;

    await db.collection("starknet_ids").findOne(
        { "token_id": id, "_chain.valid_to": null }
    ).then((doc) => { owner = (doc as any).owner; })

    if (!domain || !owner) {
        res.status(200).json({ "error": "no domain associated to this starknet id was found" });
        return;
    }

    await domainCollection.findOne(
        {
            "domain": domain,
            "addr": owner,
            "rev_addr": owner,
            "_chain.valid_to": null,
        }
    ).then((doc) => {
        if (addr)
            res.status(200).json({
                "domain": domain as string,
                "addr": addr,
                "domain_expiry": expiry,
                "is_owner_main": doc ? true : false,
            });
        else
            res.status(200).json({
                "domain": domain as string,
                "domain_expiry": expiry,
                "is_owner_main": doc ? true : false,
            });
    });

}