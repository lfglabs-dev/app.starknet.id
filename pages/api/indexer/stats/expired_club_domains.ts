import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../../types/backTypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ domain: string; club: string }[] | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });

  const { db } = await connectToDatabase();
  const domainCollection = db.collection("domains");
  const current = Math.ceil(Date.now() / 100000) * 100;
  const output = (
    await domainCollection
      .aggregate([
        {
          '$match': {
            '_chain.valid_to': null,
            'expiry': {
              '$lte': current
            }
          }
        }, {
          '$project': {
            'domain': '$domain',
            'club': {
              '$cond': [
                {
                  '$regexMatch': {
                    'input': '$domain',
                    'regex': /^.\.stark$/
                  }
                }, 'single_letter', {
                  '$cond': [
                    {
                      '$regexMatch': {
                        'input': '$domain',
                        'regex': /^\d{2}\.stark$/
                      }
                    }, '99', {
                      '$cond': [
                        {
                          '$regexMatch': {
                            'input': '$domain',
                            'regex': /^.{2}\.stark$/
                          }
                        }, 'two_letters', {
                          '$cond': [
                            {
                              '$regexMatch': {
                                'input': '$domain',
                                'regex': /^\d{3}\.stark$/
                              }
                            }, '999', {
                              '$cond': [
                                {
                                  '$regexMatch': {
                                    'input': '$domain',
                                    'regex': /^.{3}\.stark$/
                                  }
                                }, 'three_letters', {
                                  '$cond': [
                                    {
                                      '$regexMatch': {
                                        'input': '$domain',
                                        'regex': /^\d{4}\.stark$/
                                      }
                                    }, '10k', 'none'
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }, {
          '$match': {
            'club': {
              '$ne': 'none'
            }
          }
        }
      ])
      .toArray()
  ).map((doc) => {
    return {
      domain: doc.domain,
      club: doc.club,
    }
  });

  res.setHeader("cache-control", "max-age=30").status(200).json(output);
}
