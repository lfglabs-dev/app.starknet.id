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
  expiry: 1716767999000, // timestamp in ms
  discountMailGroupId: "106085143136961963",
  offer: {
    duration: 90, // in days
    customMessage: "3 months free",
    discountId: "X", // No need
    price: "0",
    desc: "Get a free 3-months renewal for all your .STARK domains.",
    title: { desc: "Renew your domain", catch: "for FREE" },
    image: "/freeRenewal/freeRenewal.webp",
  },
};
