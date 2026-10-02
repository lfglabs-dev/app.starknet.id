import { verifySubdomain, addSubdomain } from '../src/utils/domainVerifier';
import subdomains from '../src/data/subdomains.json';

describe('Subdomain Verification', () => {
  it('should verify the new subdomain', () => {
    const entry = subdomains[0];
    expect(verifySubdomain(entry)).toBe(true);
  });

  it('should add the subdomain without errors', () => {
    expect(() => addSubdomain(subdomains[0])).not.toThrow();
  });
});
