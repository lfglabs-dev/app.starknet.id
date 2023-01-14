import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { code, redirect_uri },
  } = req;

  const BasicAuthToken = Buffer.from(`${process.env.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID}:${process.env.NEXT_PUBLIC_TWITTER_OAUTH_SECRET}`, "utf8").toString(
    "base64"
  );

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");
  headers.append("Authorization", `Basic ${BasicAuthToken}`);

  const resp = await fetch(
    "https://api.twitter.com/2/oauth2/token",
    {
        method: "POST",
        headers: headers,
        body: new URLSearchParams(
            {
              grant_type: "authorization_code",
              code: code as string,
              code_verifier: "challenge",
              redirect_uri: redirect_uri as string,
            }
        ).toString(),
    }
  );
  const json = await resp.json();
  const accessToken = json.access_token;

  if (accessToken) return res
    .setHeader("cache-control", "max-age=86400")
    .status(200)
    .json({
      accessToken: accessToken
    });

  res
  .setHeader("cache-control", "max-age=86400")
  .status(400)
  .json({
    error: "Unknown"
  });
}
