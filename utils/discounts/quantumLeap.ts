// Discount details to fill in case of a duplicate of this page
type QuantumLeapDiscount = {
  offer: Discount;
  upsell: Discount;
  expiry: number;
  image: string;
  name: string;
  discountMailGroupId: string;
};

export const quantumLeapDiscount: QuantumLeapDiscount = {
  offer: {
    duration: 81,
    customMessage: "3 months (with Quantum Leap discount)",
    discountId: "1",
    price: "599178082191783",
    desc: "To celebrate the Quantum Leap, get your domain for just $1 and unlock a world of possibilities. Customize your On-chain StarkNet username, elevate your blockchain us er experience, and access domain benefits.",
    title: { desc: "Get your domain", catch: "for 1$" },
    image: "/quantumleap/quantumLeapAstro.webp",
  },
  upsell: {
    duration: 731,
    customMessage: "3 years (with Quantum Leap discount)",
    discountId: "2",
    price: "18000000000000000",
    desc: "Don't miss out on this one-time offer special Quantum Leap! Elevate your domain experience with an exclusive opportunity to renew for 3 years, while paying only for 2. Act now before it's gone!",
    title: {
      desc: "Special Offer:",
      catch: "Get 3 years for the price of 2",
    },
    image: "/quantumleap/quantumLeapAstro2.webp",
  },
  name: "The Quantum Leap",
  image: "/quantumleap/quantumLeapAstro.webp",
  expiry: 1694908799 * 1000,
  discountMailGroupId: "98859014745490932",
} as const;
