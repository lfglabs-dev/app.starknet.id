// Discount details to fill in case of a duplicate of this page
type FreeRegistration = {
  expiry: number;
  image: string;
  name: string;
  discountMailGroupId: string;
  offer: Discount;
};

export const freeRegistration: FreeRegistration = {
  name: "Domain Gift",
  image: "/register/gift.webp",
  expiry: 1726382280 * 1000, // timestamp in ms
  discountMailGroupId: "X",
  offer: {
    duration: 90, // in days
    customMessage: "3 months",
    discountId: "X",
    price: "0",
    desc: "Unlock your .stark domain for free and secure your Starknet profile!",
    title: {
      desc: "Get your",
      catch: "FREE .STARK",
      descAfter: "domain",
    },
    image: "/visuals/gift.webp",
    couponCode: true,
    couponHelper:
      "A unique and valid registration coupon code is required to claim your free domain.",
  },
};
