import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { queryError } from "../domain_to_addr";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{
        count: number;
    } | queryError>
) {

    const { db } = await connectToDatabase();
    const domainCollection = db.collection("starknet_ids");

    await domainCollection.aggregate([
        {
            '$match': {
                '_chain_valid_to': null
            }
        }, {
            '$group': {
                '_id': '$owner'
            }
        }, {
            '$count': 'total'
        }
    ]).toArray().then((docs) => {
        const doc = docs.at(0);
        res
            .setHeader("cache-control", "max-age=30")
            .status(200)
            .json({
                count: doc?.total
            });
    });

}
