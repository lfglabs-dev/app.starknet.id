// Discount details to fill in case of a duplicate of this page
export type RegistrationDiscount = {
  upsell: Discount;
  expiry: number;
  priceDuration: number;
  discountMailGroupId: string;
};

export const registrationDiscount: RegistrationDiscount = {
  upsell: {
    duration: 3, // in years
    customMessage: "3 years",
    discountId: "2", //todo: update this with the right discountId
    desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
    title: {
      desc: "Unlock Extended Domain",
      catch: "3 Years for the Price of 2!",
    },
    image: "/register/registerUpsell.webp",
  },
  priceDuration: 2,
  expiry: 1733309784 * 1000, // timestamp in ms
  discountMailGroupId: "98859014745490932", // todo: replace with right mail group id
};
