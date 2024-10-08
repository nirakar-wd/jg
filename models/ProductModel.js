const slugify = require("slugify");

module.exports = (sequelize, DataTypes) => {
  const { INTEGER, STRING, DATE, TEXT, DECIMAL, UUID, UUIDV4 } = DataTypes;

  const Product = sequelize.define(
    "products",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      slug: {
        type: STRING(50),
        allowNull: false,
      },
      description: {
        type: TEXT,
      },
      features: {
        type: TEXT,
      },
      price: {
        type: DECIMAL(10, 2),
        allowNull: false,
      },
      discountedPrice: {
        type: DECIMAL(10, 2),
        allowNull: true,
        field: "discounted_price",
      },
      stock: {
        type: INTEGER(11),
        allowNull: false,
      },
      vendor: {
        type: STRING(50),
        allowNull: true,
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
      tableName: "products",
      indexes: [{ fields: ["slug"] }],
      hooks: {
        beforeValidate: function (product, options) {
          product.slug = slugify(product.name, { lower: true });
        },
      },
    }
  );

  Product.associate = (models) => {
    /* // Produc.scope('withImages').findAll().then()
        Product.addScope('withImages', {
            include: [{
                required: false,
                model: models.ProductImage,
                as: 'images',
                attributes: ['id', 'filePath'],
            }]
        });
        */

    // here is how we add defaultScope programmatically
    Product.addScope(
      "defaultScope",
      {
        include: [
          {
            required: false,
            model: models.ProductImage,
            as: "images",
            attributes: ["id", "filePath"],
          },
        ],
      },
      {
        // defaultScope already exists, to avoid the error pass override
        override: true,
      }
    );

    Product.hasMany(models.OrderItem, {
      foreignKey: "productId",
    });

    Product.hasMany(models.Comment);
    Product.hasMany(models.Cart);
    Product.hasMany(models.ProductImage, { as: "images" });
    // Product.hasMany(models.ProductCategory);
    Product.belongsToMany(models.Category, {
      through: models.ProductCategory,
      foreignKey: "productId",
      otherKey: "categoryId",
    });

    // Product.hasMany(models.ProductTag);
    Product.belongsToMany(models.Tag, {
      through: models.ProductTag,
      foreignKey: "productId",
      otherKey: "tagId",
    });

    //product has many collections
    Product.belongsToMany(models.Collection, {
      through: models.ProductCollection,
      foreignKey: "productId",
      otherKey: "collectionId",
    });
  };

  Product.beforeBulkUpdate((product) => {
    product.attributes.updateTime = new Date();
    return product;
  });

  return Product;
};
