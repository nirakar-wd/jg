const PAYMENT_STATUS = require("../constants").PAYMENT_STATUS;
const _ = require("lodash");

module.exports = function (sequelize, DataTypes) {
  const { INTEGER, DATE, DECIMAL, UUID, STRING, UUIDV4 } = DataTypes;

  const Payment = sequelize.define(
    "payments",
    {
      id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: INTEGER,
        allowNull: false,
        field: "orderId",
        references: {
          model: "orders",
          key: "id",
        },
      },
      paymentAmount: {
        type: DECIMAL(10, 2),
        allowNull: false,
        field: "payment_amount",
      },
      paymentMethod: {
        type: STRING,
        allowNull: false,
        field: "payment_method",
      },

      paymentStatus: {
        type: INTEGER,
        allowNull: false,
        field: "payment_status",
        values: [
          PAYMENT_STATUS.pending.ordinal,
          PAYMENT_STATUS.paid.ordinal,
          PAYMENT_STATUS.failed.ordinal,
          PAYMENT_STATUS.refunded.ordinal,
        ],
      },
      paymentStatusStr: {
        type: DataTypes.VIRTUAL,
        get: function () {
          let result = undefined;
          _.forOwn(PAYMENT_STATUS, (value, key) => {
            if (value.ordinal === this.get("paymentStatus")) {
              return (result = key);
            }
          });
          return result;
        },
      },
      transactionId: {
        type: STRING,
        unique: true,
        allowNull: false,
        field: "transaction_id",
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updated_at",
      },
    },
    {
      timestamps: false,
      tableName: "payments",
      indexes: [
        { fields: ["orderId"] },
        { fields: ["transactionId"] },
      ],
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: "orderId" });
  };

  Payment.beforeBulkUpdate((payment) => {
    payment.attributes.updateTime = new Date();
    return payment;
  });

  return Payment;
};
