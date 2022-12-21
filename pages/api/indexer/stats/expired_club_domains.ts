import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ domain: string, expiry: number }[] | queryError>
) {
    const { query: { club }, } = req;
    const { db } = await connectToDatabase();
    const domainCollection = db.collection("domains");

    let regex;
    switch (club) {
        case "single_letter":
            regex = /^.\.stark$/;
            break;
        case "two_letters":
            regex = /^.{2}\.stark$/;
            break;
        case "three_letters":
            regex = /^.{3}\.stark$/;
            break;
        case "99": // according to the enlightened despot, this club is called "99" even though it contains 100 domains
            regex = /^\d{2}\.stark$/;
            break;
        case "999":
            regex = /^\d{3}\.stark$/;
            break;
        case "10k":
            regex = /^\d{4}\.stark$/;
            break;
    }

    const documents = domainCollection.find({
        'expiry': { "$lte": Math.ceil(Date.now() / 100000) * 100, },
        'domain': { '$regex': regex },
        '_chain.valid_to': { "$eq": null },
    })
    let output = [];
    for (const doc of await documents.toArray()) {
        output.push({ domain: doc.domain, expiry: doc.expiry });
    }

    res
        .setHeader("cache-control", "max-age=30")
        .status(200)
        .json(output);
}
