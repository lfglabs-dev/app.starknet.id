import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

type Data = { domain: string, domain_expiry: number } | { error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>) {

    const { query: { addr }, } = req;
    const { db } = await connectToDatabase();
    await db.collection("domains").findOne(
        {
            "addr": addr,
            "rev_addr": addr,
            "_chain.valid_to": null,
        }
    ).then((domainDoc) => {
        res.setHeader("cache-control", "max-age=30").status(200).json(domainDoc
            ? { "domain": domainDoc.domain, "domain_expiry": domainDoc.expiry }
            : { "error": "no domain found" }
        )
    });

}