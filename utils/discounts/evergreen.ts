export const renewal: Upsell = {
  duration: 3,
  paidDuration: 2,
  maxDuration: 1,
  discountId: "1",
  imageUrl: "/register/gift.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Take advantage of this exclusive offer! Secure your domain for three years at the price of two years.",
};

export const registration: Upsell = {
  duration: 3,
  paidDuration: 2,
  maxDuration: 1,
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
