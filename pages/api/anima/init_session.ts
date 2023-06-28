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
  const myHeaders = new Headers();
  myHeaders.append("Api-Key", process.env.NEXT_PUBLIC_ANIMA_API_KEY as string);
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
  };

  fetch("https://api.pop.anima.io/v1/personhood/init", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(
        "An error occured while initializing a new Anima session",
        error
      );
      res.status(404).json(error);
    });
}
