import { getResolverContract } from "../../utils/resolverService";

describe("getResolverContract function", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the contract address for "xplorer" domain kind', () => {
    process.env.NEXT_PUBLIC_XPLORER_RESOLVER_CONTRACT =
      "xplorer_contract_address";
    expect(getResolverContract("xplorer")).toBe("xplorer_contract_address");
  });

  it('should return the contract address for "braavos" domain kind', () => {
    process.env.NEXT_PUBLIC_BRAAVOS_RESOLVER_CONTRACT =
      "braavos_contract_address";
    expect(getResolverContract("braavos")).toBe("braavos_contract_address");
  });

  it('should return an empty string for "root" domain kind', () => {
    expect(getResolverContract("root")).toBe("");
  });

  it('should return an empty string for "subdomain" domain kind', () => {
    expect(getResolverContract("subdomain")).toBe("");
  });

  it('should return an empty string for "none" domain kind', () => {
    expect(getResolverContract("none")).toBe("");
  });

  it('should return an empty string for "sol" domain kind', () => {
    expect(getResolverContract("sol")).toBe("");
  });
});
