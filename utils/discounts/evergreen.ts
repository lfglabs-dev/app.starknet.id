export const renewal: Upsell = {
  durationInDays: 3 * 365,
  paidDurationInDays: 2 * 365,
  maxDurationInDays: 1 * 365,
  discountId: "1",
  imageUrl: "/register/gift.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
};

export const registration: Upsell = {
  durationInDays: 3 * 365,
  paidDurationInDays: 2 * 365,
  maxDurationInDays: 1 * 365,
  discountId: "1",
  imageUrl: "/register/gift.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
};

const evergreenDiscounts = {
  registration,
  renewal,
};

export default evergreenDiscounts;
