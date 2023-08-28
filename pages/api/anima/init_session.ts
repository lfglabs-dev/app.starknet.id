import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["POST", "GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const address = req.query.address as string;
  const myHeaders = new Headers();
  myHeaders.append("Api-Key", process.env.NEXT_PUBLIC_ANIMA_API_KEY as string);
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  fetch(
    `https://api.pop.anima.io/v1/personhood/${address}/search`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      if (result && result.length > 0) {
        res.status(200).json({ session_id: result[0].session.id });
      } else {
        // init a new session
        const initRequestOptions = {
          method: "POST",
          headers: myHeaders,
        };
        fetch("https://api.pop.anima.io/v1/personhood/init", initRequestOptions)
          .then((response) => response.json())
          .then((result) => {
            console.log("result after", result);
            res.status(200).json({ session_id: result.session_id });
          })
          .catch((error) => {
            console.log(
              "An error occured while initializing a new Anima session",
              error
            );
            res.status(404).json(error);
          });
      }
    })
    .catch((error) => {
      console.log(
        "An error occured while fetching existing Anima session",
        error
      );
      res.status(404).json(error);
    });
}
