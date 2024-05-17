import { isValidEns } from "../../utils/ensService";
import { parse } from 'tldts';

jest.mock('tldts', () => ({
  parse: jest.fn(),
}));

describe('isValidEns', () => {
  it('should return true for .eth domains', () => {
    expect(isValidEns('example.eth')).toBe(true);
  });

  it('should return true for valid ICANN domains', () => {
    (parse as jest.Mock).mockReturnValue({ isIcann: true });
    expect(isValidEns('example.com')).toBe(true);
    expect(isValidEns('another.org')).toBe(true);
  });

  it('should return false for invalid ICANN domains', () => {
    (parse as jest.Mock).mockReturnValue({ isIcann: false });
    expect(isValidEns('invalid_domain')).toBe(false);
    expect(isValidEns('example.invalid')).toBe(false);
  });
});