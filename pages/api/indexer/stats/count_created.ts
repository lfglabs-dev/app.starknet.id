import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../../types/backTypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ from: number; count: number } | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { begin, end, segments },
  } = req;
  const beginTime = parseInt(begin as string) * 1000;
  const endTime = parseInt(end as string) * 1000;
  const deltaTime = Math.round(
    (endTime - beginTime) / parseInt(segments as string)
  );

  if (deltaTime > 3600 * 1000) {
    const { db } = await connectToDatabase();
    const domainCollection = db.collection("domains");

    const output = (
      await domainCollection
        .aggregate([
          {
            $match: {
              "_chain.valid_to": null,
              creation_date: {
                $gte: new Date(beginTime),
                $lte: new Date(endTime),
              },
            },
          },
          {
            $group: {
              _id: {
                $floor: {
                  $divide: [
                    {
                      $sum: [
                        {
                          $subtract: [
                            {
                              $subtract: [
                                "$creation_date",
                                new Date(beginTime),
                              ],
                            },
                            {
                              $mod: [
                                {
                                  $subtract: [
                                    "$creation_date",
                                    new Date(beginTime),
                                  ],
                                },
                                deltaTime,
                              ],
                            },
                          ],
                        },
                        beginTime,
                      ],
                    },
                    1000,
                  ],
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              from: "$_id",
              count: "$count",
            },
          },
        ])
        .toArray()
    ).map((doc) => {
      return { from: doc.from as number, count: doc.count as number };
    });

    res
      .setHeader("cache-control", "max-age=30")
      .status(200)
      .json(output as any);
  } else {
    res
      .setHeader("cache-control", "max-age=30")
      .status(200)
      .json({ error: "delta must be greater than 3600 seconds" });
  }
}
