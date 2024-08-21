
module.exports = function (sequelize, DataTypes) {
  const { INTEGER, DATE, BIGINT, DECIMAL, UUID, STRING, UUIDV4 } = DataTypes;

  const Cart = sequelize.define(
    "carts",
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      productId: {
        type: INTEGER,
        allowNull: true,
        field: "productId",
      },
      userId: {
        type: INTEGER,
        allowNull: true,
        field: "userId",
      },
      quantity: {
        type: INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "createdAt",
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updatedAt",
      },
    },
    {
      tableName: "carts",
      timestamps: true,
    }
  );

  // Cart.hasOne(CartInfo, {foreign_key: 'CartId'});

  Cart.associate = (models) => {
    Cart.belongsTo(models.Product, { foreignKey: "productId" });
    Cart.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Cart;
};
