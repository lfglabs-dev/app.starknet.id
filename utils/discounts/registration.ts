// Discount details to fill in case of a duplicate of this page
export type RegistrationDiscount = {
  upsell: Discount;
  expiry: number;
  // image: string;
  discountMailGroupId: string;
};

export const registrationDiscount: RegistrationDiscount = {
  upsell: {
    duration: 1095, // in days
    customMessage: "3 years",
    discountId: "2", //todo: update this with the right discountId
    // price: "18899999999999739",
    desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
    title: {
      desc: "Unlock Extended Domain",
      catch: "3 Years for the Price of 2!",
    },
    image: "/discount/registerUpsell.webp",
  },
  // image: "/discount/registerUpsell.webp",
  expiry: 1733309784 * 1000, // timestamp in ms
  discountMailGroupId: "98859014745490932", // todo: replace
};
