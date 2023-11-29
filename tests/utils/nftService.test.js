import { filterAssets } from "../../utils/nftService";

  describe("filterAssets function", () => {
    const mockAssets = [
      { contract_address: '0x123' },
      { contract_address: '0x456' },
      { contract_address: '0x789' },
    ];
  
    // Convert hex addresses to decimal BigInts for the whitelist
    const whitelist = [
      BigInt(parseInt('0x123', 16)), 
      BigInt(parseInt('0x789', 16)),
    ];
  
    it("should return only the assets that are in the whitelist", () => {
      const filteredAssets = filterAssets(mockAssets, whitelist);
      expect(filteredAssets).toEqual([
        { contract_address: '0x123' },
        { contract_address: '0x789' },
      ]);
    });
  
    it("should return an empty array if no assets are in the whitelist", () => {
      const emptyWhitelist = [];
      const filteredAssets = filterAssets(mockAssets, emptyWhitelist);
      expect(filteredAssets).toEqual([]);
    });
  
    it("should return an empty array if there are no assets", () => {
      const filteredAssets = filterAssets([], whitelist);
      expect(filteredAssets).toEqual([]);
    });
  
    it("should handle assets with non-whitelisted addresses", () => {
      const mockAssetsWithNonWhitelisted = [
        ...mockAssets,
        { contract_address: '0xabc' }
      ];
      const filteredAssets = filterAssets(mockAssetsWithNonWhitelisted, whitelist);
      expect(filteredAssets).toEqual([
        { contract_address: '0x123' },
        { contract_address: '0x789' },
      ]);
    });
  });
  