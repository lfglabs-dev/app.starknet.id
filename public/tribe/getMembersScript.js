const axios = require("axios");
const fs = require("fs");
const famousTribeMemberIDs = require("./famousTribeMemberIDs.json");

async function fetchTwitterData() {
  const config = {
    method: "get",
    url: `https://api.twitter.com/2/users/?ids=${famousTribeMemberIDs.join(
      ","
    )}&user.fields=profile_image_url,description,public_metrics`,
    headers: {
      Authorization: `Bearer ${process.env.TWITTER__TOKEN}}`,
    },
  };

  let response;
  try {
    response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function handler() {
  const twitterData = await fetchTwitterData();
  fs.writeFileSync(
    "output.json",
    JSON.stringify(twitterData, null, 2),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  );
}

handler();
