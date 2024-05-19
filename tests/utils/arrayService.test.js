/* eslint-disable no-undef */
import { areArraysEqual } from "../../utils/arrayService";

describe("Should test areArraysEqual function", () => {
  it("Should return true for equal arrays", () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(areArraysEqual([], [])).toBe(true);
    expect(areArraysEqual(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
  });

  it("Should return false for arrays of different lengths", () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 3, 4])).toBe(false);
    expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("Should return false for arrays with same length but different elements", () => {
    expect(areArraysEqual([1, 2, 3], [4, 5, 6])).toBe(false);
    expect(areArraysEqual(["a", "b", "c"], ["a", "b", "d"])).toBe(false);
  });

  it("Should handle arrays with different types of elements", () => {
    expect(areArraysEqual([1, "2", 3], [1, "2", 3])).toBe(true);
    expect(areArraysEqual([1, "2", 3], [1, 2, 3])).toBe(false);
  });
});
