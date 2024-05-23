import { getFreeDomain } from "../../utils/campaignService";

global.fetch = jest.fn().mockResolvedValue({
  status: 200,
  json: () => ({
    r: "0x1234567890123456789012345678901234567890",
    s: "0x1234567890123456789012345678901234567890",
  }),
});

describe("getFreeDomain function", () => {
  it("should return a free domain's signature", async () => {
    const domain = await getFreeDomain();
    expect(domain).toEqual({
      r: "0x1234567890123456789012345678901234567890",
      s: "0x1234567890123456789012345678901234567890",
    });
  });
});
