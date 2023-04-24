import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

type FullId = {
  id: string;
  domain?: string;
  domain_expiry?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    full_ids: Array<FullId>;
  }>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { addr },
  } = req;
  const { db } = await connectToDatabase();

  const pipeline = [
    {
      $match: {
        owner: addr,
        "_chain.valid_to": null,
      },
    },
    {
      $lookup: {
        from: "domains",
        let: { token_id: "$token_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$token_id", "$$token_id"] },
                  { $eq: ["$_chain.valid_to", null] },
                ],
              },
            },
          },
        ],
        as: "domainData",
      },
    },
    {
      $unwind: {
        path: "$domainData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: "$token_id",
        domain: "$domainData.domain",
        domain_expiry: "$domainData.expiry",
      },
    },
  ];

  const documents = await db
    .collection("starknet_ids")
    .aggregate(pipeline)
    .toArray();
  const full_ids: FullId[] = documents.map((doc) => {
    return {
      id: doc.id,
      domain: doc.domain,
      domain_expiry: doc.domain_expiry,
    };
  });

  res
    .setHeader("cache-control", "max-age=30")
    .status(200)
    .json({ full_ids: full_ids });
}
