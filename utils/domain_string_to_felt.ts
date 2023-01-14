export default function domainStringToFelt(domain: string) {
    const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
    const bigAlphabet = "这来";

    let felt = 0;
    let multiplier = 1;
    for (let i = 0; i < domain.length; i++) {
        const char = domain[i];
        const code = basicAlphabet.indexOf(char);
        if (code != -1) {
            felt += code * multiplier;
            multiplier *= basicAlphabet.length + 1;
        } else {
            const code2 = bigAlphabet.indexOf(char);
            if (code2 != -1) {
                felt += (code2 + 1) * multiplier;
                multiplier *= bigAlphabet.length + 1;
            } else {
                felt += multiplier;
                multiplier *= bigAlphabet.length + 1;
            }
        }
    }
    return felt;
}