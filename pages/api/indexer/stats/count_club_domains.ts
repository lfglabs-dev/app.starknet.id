import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{
        count: number;
    } | queryError>
) {
    const { query: { club, since }, } = req;
    const sinceTime = parseInt(since as string) * 1000;
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

    let domains_count: number | undefined;
    await domainCollection.countDocuments({
        'creation_date': {
            '$gte': new Date(sinceTime),
        },
        'domain': { '$regex': regex },
        '_chain.valid_to': { "$eq": null },
    }).then((count) => {
        domains_count = count;
    });

    res
        .setHeader("cache-control", "max-age=30")
        .status(200)
        .json({
            count: domains_count as number,
        });

}
