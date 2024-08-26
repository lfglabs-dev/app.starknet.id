import {
  getNonSubscribedDomains,
  fullIdsToDomains,
} from "../../utils/subscriptionService";

describe("getNonSubscribedDomains function", () => {
  const mockData = {
    "example.stark": { CURRENCY1: true, CURRENCY2: false },
    "example2.stark": { CURRENCY1: true, CURRENCY2: true },
    "example3.stark": { CURRENCY1: false, CURRENCY2: false },
  };

  it("should return an array of domains that have at least one currency set to true", () => {
    const expectedOutput = ["example.stark", "example2.stark"];
    const result = getNonSubscribedDomains(mockData);
    expect(result).toEqual(expectedOutput);
  });

  it("should return an empty array if no domains have currencies set to true", () => {
    const noTrueData = {
      "domain1.stark": { CURRENCY1: false, CURRENCY2: false },
      "domain2.stark": { CURRENCY1: false, CURRENCY2: false },
    };
    const expectedOutput = [];
    const result = getNonSubscribedDomains(noTrueData);
    expect(result).toEqual(expectedOutput);
  });

  it("should return all domains if all have at least one currency set to true", () => {
    const allTrueData = {
      "domain1.stark": { CURRENCY1: true, CURRENCY2: false },
      "domain2.stark": { CURRENCY1: false, CURRENCY2: true },
    };
    const expectedOutput = ["domain1.stark", "domain2.stark"];
    const result = getNonSubscribedDomains(allTrueData);
    expect(result).toEqual(expectedOutput);
  });
});

describe("fullIdsToDomains", () => {
  it("should return an array of domains that are Stark root domains", () => {
    const mockFullIds: FullId[] = [
      { id: "1", domain: "example.stark", domain_expiry: null, pp_url: null },
      { id: "2", domain: "example.com", domain_expiry: null, pp_url: null },
      { id: "3", domain: "another.stark", domain_expiry: null, pp_url: null },
    ];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual(["example.stark", "another.stark"]);
  });

  it("should return an empty array if no domains are Stark root domains", () => {
    const mockFullIds: FullId[] = [
      { id: "1", domain: "example.com", domain_expiry: null, pp_url: null },
      { id: "2", domain: "another.com", domain_expiry: null, pp_url: null },
    ];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual([]);
  });

  it("should handle an empty input array", () => {
    const mockFullIds: FullId[] = [];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual([]);
  });
});
