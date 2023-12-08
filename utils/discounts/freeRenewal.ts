// Discount details to fill in case of a duplicate of this page
type FreeRenewalDiscount = {
  name: string;
  image: string;
  expiry: number;
  discountMailGroupId: string;
  offer: Discount;
};

export const freeRenewalDiscount: FreeRenewalDiscount = {
  name: "The Free Renewal",
  image: "/freeRenewal/freeRenewal.webp",
  expiry: 1702425599 * 1000, // timestamp in ms
  discountMailGroupId: "106085143136961963",
  offer: {
    duration: 90, // in days
    customMessage: "3 months (with Free Renewal discount)",
    discountId: "X", // No need
    price: "0",
    desc: "To celebrate the subscription launch, We decided to give a free 3-months renewal to all .STARK domain holders.",
    title: { desc: "Renew your domain", catch: "for FREE" },
    image: "/freeRenewal/freeRenewal.webp",
  },
};
