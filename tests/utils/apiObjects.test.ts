import { Identity } from "../../utils/apiObjects";
require("dotenv").config({ path: ".env.test" });

describe("Should test Identity object", () => {
  it("Should return the right address", () => {
    const identity = new Identity(getSampleData1());
    expect(identity.targetAddress).toEqual(
      "0x00a00373a00352aa367058555149b573322910d54fcdf3a926e3e56d0dcb4b0c"
    );
  });

  it("Should return the user's twitter id from old verifier", () => {
    const identity = new Identity(getSampleData1());
    expect(identity.oldTwitterData).toEqual("789473368550567936");
  });

  it("Should return the user's discord id", () => {
    const identity = new Identity(getSampleData1());
    expect(identity.discordData).toEqual("1138759348147990529");
  });

  it("Should return the user's pop", () => {
    const identity = new Identity(getSampleData1());
    expect(identity.pop).toEqual(false);
  });
});

function getSampleData1(): IdentityData {
  return {
    id: "0x0000000000000000000000000000000000000000000000000000000000000001",
    owner: "0x00a00373a00352aa367058555149b573322910d54fcdf3a926e3e56d0dcb4b0c",
    main: false,
    creation_date: 1671228830,
    domain: {
      domain: "th0rgal.stark",
      root: true,
      creation_date: 1671228943,
      expiry: 1828908943,
      resolver:
        "0x03c571617caa8578c5cf9ded5e238b3190e6efd60e73643bb4cff9f374978026",
      legacy_address:
        "0x00a00373a00352aa367058555149b573322910d54fcdf3a926e3e56d0dcb4b0c",
      rev_address:
        "0x00a00373a00352aa367058555149b573322910d54fcdf3a926e3e56d0dcb4b0c",
    },
    user_data: [
      {
        field:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        data: "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    ],
    verifier_data: [
      {
        verifier:
          "0x003bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce",
        field:
          "0x000000000000000000000000000000000000000000000000000000006e616d65",
        data: "0x01906b81b516288254d766bf5b743582ce3821769f4cc5e27a7dd73db94b4255",
      },
      {
        verifier:
          "0x04d546c8d60cfd591557ac0613be5ceeb0ea6f797e7d11c0b5160d145fa3089f",
        field:
          "0x0000000000000000000000000000000000000000000000000000676974687562",
        data: "0x00000000000000000000000000000000000000000000000000000000027e4773",
      },
      {
        verifier:
          "0x04d546c8d60cfd591557ac0613be5ceeb0ea6f797e7d11c0b5160d145fa3089f",
        field:
          "0x00000000000000000000000000000000000000000000000000646973636f7264",
        data: "0x00000000000000000000000000000000000000000000000009d33f313202005d",
      },
      {
        verifier:
          "0x04d546c8d60cfd591557ac0613be5ceeb0ea6f797e7d11c0b5160d145fa3089f",
        field:
          "0x0000000000000000000000000000000000000000000000000074776974746572",
        data: "0x0000000000000000000000000000000000000000000000000af4c5d88c167000",
      },
      {
        verifier:
          "0x01c711cdb39bb1a069e425899ad415aa544aae7f27e8eb384b1daae66c72c6b9",
        field:
          "0x0000000000000000000000000070726f6f665f6f665f706572736f6e686f6f64",
        data: "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
      {
        verifier:
          "0x019e5204152a72891bf8cd0bed8f03593fdb29ceacd14fca587be5d9fcf87c0e",
        field:
          "0x0000000000000000000000000000000000000000000000000000676974687562",
        data: "0x00000000000000000000000000000000000000000000000000000000027e4773",
      },
      {
        verifier:
          "0x019e5204152a72891bf8cd0bed8f03593fdb29ceacd14fca587be5d9fcf87c0e",
        field:
          "0x00000000000000000000000000000000000000000000000000646973636f7264",
        data: "0x0000000000000000000000000000000000000000000000000fcdaf97ff043001",
      },
      {
        verifier:
          "0x03cac3228b434259734ee0e4ff445f642206ea11adace7e4f45edd2596748698",
        field:
          "0x00000000000000000000000000000000006e66745f70705f636f6e7472616374",
        data: "0x041e1382e604688da7f22e7fbb6113ba3649b84a87b58f4dc1cf5bfa96dfc2cf",
      },
    ],
  };
}
