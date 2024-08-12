const ORDER_STATUS = {
  processed: {
    ordinal: 0,
  },
  delivered: {
    ordinal: 1,
  },
  shipped: {
    ordinal: 2,
  },
};

const PAYMENT_STATUS = {
  pending: { ordinal: 0 },
  paid: { ordinal: 1 },
  failed: { ordinal: 2 },
  refunded: { ordinal: 3 },
};

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
};
