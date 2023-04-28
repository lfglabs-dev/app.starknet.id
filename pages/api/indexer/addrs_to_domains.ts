import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Array<{ domain: string | null; address: string }>>
) {
    await NextCors(req, res, {
        methods: ["POST"],
        origin: "*",
        optionsSuccessStatus: 200,
    });

    const { body: { addresses } } = req;
    const { db } = await connectToDatabase();
    const aggregationResult = await db
        .collection("domains")
        .aggregate([
            {
                $match: {
                    addr: { $in: addresses },
                    "_chain.valid_to": null,
                    $expr: { $eq: ["$addr", "$rev_addr"] },
                },
            },
            {
                $project: {
                    _id: 0,
                    domain: 1,
                    address: "$addr",
                },
            },
        ])
        .toArray();

    const result = addresses.map((address: string) => {
        const found = aggregationResult.find((item) => item.address === address);
        if (found) {
            return found;
        } else {
            return { domain: null, address };
        }
    });

    res
        .setHeader("cache-control", "max-age=30")
        .status(200)
        .json(result);
}