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

  it("should handle an error response from the server", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 500,
      json: () => {
        throw new Error("Internal Server Error");
      },
      text: () => "Internal Server Error",
    });
    const domain = await getFreeDomain();
    expect(domain).toEqual({
      error: "Internal Server Error",
    });
  });

  it("should handle Coupon code already used", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 400,
      json: () => {
        throw new Error("Coupon code already used");
      },
      text: () => "Coupon code already used",
    });
    const domain = await getFreeDomain();
    expect(domain).toEqual({
      error: "Coupon code already used",
    });
  });
});
