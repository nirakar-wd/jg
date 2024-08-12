module.exports = (sequelize, DataTypes) => {
  const ProductCollection = sequelize.define(
    "products_collections",
    {
      productId: {
        type: DataTypes.INTEGER,
        field: "productId",
      },
      collectionId: {
        type: DataTypes.INTEGER,
        field: "collectionId",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },
    },
    {
      tableName: "products_collections",
      timestamps: false,
      classMethods: {
        associate(models) {
          ProductCollection.belongsTo(models.Product, {
            as: "product",
            foreignKey: "productId",
          });
          // ProductCategory.belongsTo(models.Category);
          ProductCollection.belongsTo(models.Collection, {
            as: "collection",
            foreignKey: "collectionId",
          });
        },
      },
    }
  );

  return ProductCollection;
};
