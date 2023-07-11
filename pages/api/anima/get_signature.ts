import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["POST"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { sessionId },
  } = req;

  const myHeaders = new Headers();
  myHeaders.append("Api-Key", process.env.NEXT_PUBLIC_ANIMA_API_KEY as string);
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ session_id: sessionId as string }),
  };

  fetch("https://api.pop.anima.io/v1/personhood/sign/starknet", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      res.setHeader("cache-control", "max-age=30").status(200).json(result);
    })
    .catch((error) => {
      console.log(
        "An error occured while initializing a new Anima session",
        error
      );
      res.status(404).json(error);
    });
}
