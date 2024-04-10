export const renewal: Upsell = {
  duration: 3,
  paidDuration: 2,
  maxDuration: 1,
  discountId: "0",
  imageUrl: "/register/registerUpsell.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
};

export const registration: Upsell = {
  duration: 3,
  paidDuration: 2,
  maxDuration: 1,
  discountId: "0",
  imageUrl: "/register/registerUpsell.webp",
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
