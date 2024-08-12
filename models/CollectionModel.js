const slugify = require("slugify");
module.exports = function (sequelize, DataTypes) {
  const { INTEGER, STRING, TEXT } = DataTypes;
  const Collection = sequelize.define(
    "collections",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(50),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updated_at",
      },
    },
    {
      timestamps: false,
      tableName: "collections",

      hooks: {
        beforeValidate: function (collection, options) {
          collection.slug = slugify(collection.name, { lower: true });
        },
      },
    }
  );

  Collection.associate = function (models) {
    Collection.belongsToMany(models.Product, { through: models.ProductCollection });
  };
  Collection.beforeBulkUpdate((collection) => {
    collection.attributes.updateTime = new Date();
    return collection;
  });

  return Collection;
};
