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
        .collection("starknet_ids")
        .aggregate([
            {
                $match: {
                    owner: { $in: addresses },
                    "_chain.valid_to": null,
                },
            },
            {
                $lookup: {
                    from: "domains",
                    localField: "token_id",
                    foreignField: "token_id",
                    as: "domain_info",
                },
            },
            {
                $unwind: {
                    path: "$domain_info",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    "domain_info._chain.valid_to": { $eq: null },
                },
            },
            {
                $project: {
                    _id: 0,
                    domain: "$domain_info.domain",
                    address: "$owner",
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