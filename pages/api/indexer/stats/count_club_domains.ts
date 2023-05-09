import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../../types/backTypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<{ club: string; count: number }> | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { since },
  } = req;

  const beginTime = parseInt(since as string) * 1000;
  const { db } = await connectToDatabase();
  const domainCollection = db.collection("domains");
  const subdomainCollection = db.collection("subdomains");

  const subdomainOutput = await subdomainCollection
    .aggregate([
      {
        $match: {
          "_chain.valid_to": null,
          creation_date: {
            $gte: new Date(beginTime),
          },
          project: "braavos",
        },
      },
      {
        $group: {
          _id: "$project",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          club: "$_id",
          count: "$count",
        },
      },
    ])
    .toArray();

  const dbOutput = await domainCollection
    .aggregate([
      {
        $match: {
          "_chain.valid_to": null,
          creation_date: {
            $gte: new Date(beginTime),
          },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              {
                $regexMatch: {
                  input: "$domain",
                  regex: /^.\.stark$/,
                },
              },
              "single_letter",
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$domain",
                      regex: /^\d{2}\.stark$/,
                    },
                  },
                  "99",
                  {
                    $cond: [
                      {
                        $regexMatch: {
                          input: "$domain",
                          regex: /^.{2}\.stark$/,
                        },
                      },
                      "two_letters",
                      {
                        $cond: [
                          {
                            $regexMatch: {
                              input: "$domain",
                              regex: /^\d{3}\.stark$/,
                            },
                          },
                          "999",
                          {
                            $cond: [
                              {
                                $regexMatch: {
                                  input: "$domain",
                                  regex: /^.{3}\.stark$/,
                                },
                              },
                              "three_letters",
                              {
                                $cond: [
                                  {
                                    $regexMatch: {
                                      input: "$domain",
                                      regex: /^\d{4}\.stark$/,
                                    },
                                  },
                                  "10k",
                                  {
                                    $cond: [
                                      {
                                        $regexMatch: {
                                          input: "$domain",
                                          regex: /^.{4}\.stark$/,
                                        },
                                      },
                                      "four_letters",
                                      {
                                        $cond: [
                                          {
                                            $regexMatch: {
                                              input: "$domain",
                                              regex: /^.*\.vip\.stark$/,
                                            },
                                          },
                                          "og",
                                          {
                                            $cond: [
                                              {
                                                $regexMatch: {
                                                  input: "$domain",
                                                  regex: /^.*\.everai\.stark$/,
                                                },
                                              },
                                              "everai",
                                              {
                                                $cond: [
                                                  {
                                                    $regexMatch: {
                                                      input: "$domain",
                                                      regex:
                                                        /^.*\.onsheet\.stark$/,
                                                    },
                                                  },
                                                  "onsheet",
                                                  "none",
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          club: "$_id",
          count: "$count",
        },
      },
    ])
    .toArray();

  let _99;
  let _999;
  let _10k;
  for (const doc of dbOutput) {
    if (doc.club === "99") _99 = doc.count;
    else if (doc.club === "999") _999 = doc.count;
    else if (doc.club === "10k") _10k = doc.count;
  }

  const output = [];
  for (const doc of dbOutput) {
    if (doc.club === "two_letters") {
      output.push({
        club: doc.club,
        count: doc.count + _99,
      });
    } else if (doc.club === "three_letters") {
      output.push({
        club: doc.club,
        count: doc.count + _999,
      });
    } else if (doc.club === "four_letters") {
      output.push({
        club: doc.club,
        count: doc.count + _10k,
      });
    } else {
      output.push({
        club: doc.club,
        count: doc.count,
      });
    }
  }

  for (const doc of subdomainOutput) {
    output.push({
      club: doc.club,
      count: doc.count,
    });
  }

  res.setHeader("cache-control", "max-age=30").status(200).json(output);
}
