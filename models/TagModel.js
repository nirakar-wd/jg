"use strict";
const slugify = require("slugify");

module.exports = (sequelize, DataTypes) => {
  const { INTEGER, STRING, TEXT } = DataTypes;
  const Tag = sequelize.define(
    "tags",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: DataTypes.STRING(50), allowNull: false },
      slug: { type: DataTypes.STRING(50), allowNull: false },
      description: { type: DataTypes.STRING(50) },
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
      tableName: "tags",
      
      hooks: {
        beforeValidate: function (tag, options) {
          tag.slug = slugify(tag.name, { lower: true });
        },
      },
    }
  );
  Tag.associate = function (models) {
    // as is required because Tag.hasMany ProductTag and Product.hasMany ProductTag so sequelize
    // generates the same alias twice and hence it throws an exception, with as, we are setting another alias name
    // in order to not collide.
    //    Tag.hasMany(models.ProductTag,{as: 'productsTags'});
    Tag.belongsToMany(models.Product, { through: models.ProductTag });
    Tag.hasMany(models.TagImage, { as: "images" });
  };
  return Tag;
};
