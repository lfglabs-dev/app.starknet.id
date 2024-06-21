export const renewal: Upsell = {
  durationInDays: 3 * 365,
  paidDurationInDays: 2 * 365,
  maxDurationInDays: 365,
  discountId: "1",
  imageUrl: "/register/gift.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Take advantage of this exclusive offer! Secure your domain for three years at the price of two years.",
};

export const registration: Upsell = {
  durationInDays: 3 * 365,
  paidDurationInDays: 2 * 365,
  maxDurationInDays: 365,
  discountId: "1",
  imageUrl: "/register/gift.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Take advantage of this exclusive offer! Secure your domain for three years at the price of two years.",
};

const evergreenDiscounts = {
  registration,
  renewal,
};

export default evergreenDiscounts;
