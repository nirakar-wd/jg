const _ = require("lodash");
const sequelize = require("../models/index").sequelize;
const Product = require("../models/index").Product;
const ProductTag = require("../models/index").ProductTag;
const Tag = require("../models/index").Tag;
const ProductImage = require("../models/index").ProductImage;
const Category = require("../models/index").Category;
const Comment = require("../models/index").Comment;
const User = require("../models/index").User;

const AppResponseDto = require("./../dtos/responses/appResponseDto");
const ProductRequestDto = require("./../dtos/requests/productsDto");
const ProductResponseDto = require("./../dtos/responses/productsDto");

// Get All Products
exports.getAll = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  Promise.all([
    Product.findAll({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "slug", "price", "created_at", "updated_at"],
      include: [
        { model: Tag, attributes: ["id", "name"] },
        { model: Category, attributes: ["id", "name"] },
      ],
    }),
    Product.findAndCountAll({ attributes: ["id"] }),
  ])
    .then(([products, productsCount]) => {
      Comment.findAll({
        where: {
          productId: {
            [sequelize.Op.in]: products.map((product) => product.id),
          },
        },
        attributes: [
          "productId",
          [sequelize.fn("COUNT", sequelize.col("id")), "commentsCount"],
        ],
        group: "productId",
      })
        .then((comments) => {
          products.forEach((product) => {
            let comment = comments.find((c) => product.id === c.productId);
            product.comments_count = comment ? comment.get("commentsCount") : 0;
          });
          res.json(
            ProductResponseDto.buildPagedList(
              products,
              page,
              pageSize,
              productsCount.count,
              req.baseUrl
            )
          );
        })
        .catch((err) =>
          res.json(AppResponseDto.buildWithErrorMessages(err.message))
        );
    })
    .catch((err) => res.status(400).send(err.message));
};

// Get Product by ID or Slug
exports.getByIdOrSlug = (req, res, next) => {
  Product.findOne({
    where: {
      [sequelize.Op.or]: [
        { id: req.params.idOrSlug },
        { slug: req.params.idOrSlug },
      ],
    },
    include: [
      { model: Tag, attributes: ["id", "name"] },
      { model: Category, attributes: ["id", "name"] },
      {
        model: Comment,
        attributes: ["id", "content"],
        include: [{ model: User, attributes: ["id", "username"] }],
      },
    ],
  })
    .then((product) =>
      res.json(ProductResponseDto.buildDetails(product, true, false))
    )
    .catch((err) =>
      res.json(AppResponseDto.buildWithErrorMessages(err.message))
    );
};

exports.searchProduct = (req, res, next) => {
  const products = Product.findAll({
    where: {
      slug: { [Op.like]: "%" + req.slug + "%" },
    },
  });
};

exports.getByTag = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  ProductTag.findAll({
    where: { tagId: req.tagId },
    attributes: ["productId"],
    order: [["createdAt", "DESC"]],
  })
    .then((pts) => {
      let productIds = pts.map((pt) => pt.productId);
      const productsCount = pts.length;
      productIds = _.slice(productIds, offset, offset + limit);
      Promise.all([
        Product.findAll({
          attributes: ["id", "name", "slug", "created_at", "updated_at"],
          where: {
            id: {
              [sequelize.Op.in]: productIds,
            },
          },
          include: [Tag, Category],
        }),
        Comment.findAll({
          where: {
            productId: {
              [sequelize.Op.in]: productIds,
            },
          },
          attributes: [
            "id",
            "productId",
            [sequelize.fn("count", sequelize.col("id")), "commentsCount"],
          ],
          // instance.get('productsCount')
          group: "productId",
        }),
      ])
        .then((results) => {
          const products = results[0];
          const comments = results[1];

          products.forEach((product) => {
            let comment = comments.find(
              (comment) => product.id === comment.productId
            );
            if (comment != null)
              product.comments_count = comment.get("commentsCount");
            else product.comments_count = 0;
          });

          return res.json(
            ProductResponseDto.buildPagedList(
              products,
              page,
              pageSize,
              productsCount,
              req.baseUrl
            )
          );
        })
        .catch((err) => {
          return res.json(AppResponseDto.buildWithErrorMessages(err.message));
        });
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.getByCategory = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  const categoryQuery = {};
  if (!!req.params.category_slug) categoryQuery.slug = req.params.category_slug;
  else categoryQuery.id = req.params.categoryId;

  Product.findAndCountAll({
    attributes: ["id", "name", "slug", "created_at", "updated_at"],
    include: [
      {
        model: Category,
        where: categoryQuery,
        // through: {attributes: ['id'],}
      },
      {
        model: Tag,
        exclude: ["description", "created_at", "updated_at"],
      },
      {
        model: Comment,
        attributes: ["id", "productId"],
        group: "productId",
      },
    ],

    order: [
      ["createdAt", "DESC"],
      // ['price', 'DESC']
    ],

    offset,
    limit: pageSize,
  })
    .then((products) => {
      return res.json(
        ProductResponseDto.buildPagedList(
          products.rows,
          page,
          pageSize,
          products.count,
          req.baseUrl
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

// Create Product
exports.createProduct = (req, res) => {
  const bindingResult = ProductRequestDto.createProductResponseDto(req);
  
  if (!_.isEmpty(bindingResult.errors)) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(bindingResult.errors)
    );
  }

  let transac;
  sequelize
    .transaction({ autocommit: false })
    .then(async (transaction) => {
      transac = transaction;
      const tags = req.body.tags || [];
      const categories = req.body.categories || [];
      const promises = [];

      tags.forEach(({ name, description }) => {
        promises.push(
          Tag.findOrCreate({ where: { name }, defaults: { description } })
        );
      });

      Object.entries(categories).forEach(([name, description]) => {
        promises.push(
          Category.findOrCreate({ where: { name }, defaults: { description } })
        );
      });

      promises.push(
        Product.create(bindingResult.validatedData, { transaction })
      );

      const results = await Promise.all(promises);
      promises.length = 0;

      const product = results.pop();
      const tagsToSet = results
        .filter((result) => result[0].constructor.getTableName() === "tags")
        .map((result) => result[0]);
      const categoriesToSet = results
        .filter(
          (result) => result[0]._modelOptions.name.plural === "categories"
        )
        .map((result) => result[0]);

      promises.push(product.setTags(tagsToSet, { transaction }));
      promises.push(product.setCategories(categoriesToSet, { transaction }));

      if (req.files) {
        req.files.forEach((file) => {
          let filePath = file.path.replace(/\\/g, "/").replace("public", "");
          promises.push(
            ProductImage.create(
              {
                fileName: file.filename,
                filePath,
                originalName: file.originalname,
                fileSize: file.size,
                productId: product.id,
              },
              { transaction }
            )
          );
        });
      }

      await Promise.all(promises);
      transaction.commit();
      res.json(
        AppResponseDto.buildWithDtoAndMessages(
          ProductResponseDto.buildDto(product),
          "Product created successfully"
        )
      );
    })
    .catch((err) => {
      if (transac) transac.rollback();
      res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

// Update Product
exports.updateProduct = (req, res) => {
  const bindingResult = ProductRequestDto.updateProductResponseDto(req);
  if (!_.isEmpty(bindingResult.errors)) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(bindingResult.errors)
    );
  }

  let transac;
  sequelize
    .transaction({ autocommit: false })
    .then(async (transaction) => {
      transac = transaction;
      const product = await Product.findByPk(req.params.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      await product.update(bindingResult.validatedData, { transaction });

      const tags = req.body.tags || [];
      const categories = req.body.categories || [];
      const promises = [];

      tags.forEach(({ name, description }) => {
        promises.push(
          Tag.findOrCreate({ where: { name }, defaults: { description } })
        );
      });

      Object.entries(categories).forEach(([name, description]) => {
        promises.push(
          Category.findOrCreate({ where: { name }, defaults: { description } })
        );
      });

      const results = await Promise.all(promises);
      promises.length = 0;

      const tagsToSet = results
        .filter((result) => result[0].constructor.getTableName() === "tags")
        .map((result) => result[0]);
      const categoriesToSet = results
        .filter(
          (result) => result[0]._modelOptions.name.plural === "categories"
        )
        .map((result) => result[0]);

      promises.push(product.setTags(tagsToSet, { transaction }));
      promises.push(product.setCategories(categoriesToSet, { transaction }));

      if (req.files) {
        req.files.forEach((file) => {
          let filePath = file.path.replace(/\\/g, "/").replace("public", "");
          promises.push(
            ProductImage.create(
              {
                fileName: file.filename,
                filePath,
                originalName: file.originalname,
                fileSize: file.size,
                productId: product.id,
              },
              { transaction }
            )
          );
        });
      }

      await Promise.all(promises);
      transaction.commit();
      res.json(
        AppResponseDto.buildWithDtoAndMessages(
          ProductResponseDto.buildDto(product),
          "Product updated successfully"
        )
      );
    })
    .catch((err) => {
      if (transac) transac.rollback();
      res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

// Delete Product
exports.deleteProduct = (req, res, next) => {
  Product.findByPk(req.params.productId)
    .then((product) => {
      if (!product) {
        return res.json(
          AppResponseDto.buildWithErrorMessages("Product not found")
        );
      }
      return product
        .destroy()
        .then(() =>
          res.json(
            AppResponseDto.buildSuccessWithMessages(
              "Product deleted successfully"
            )
          )
        );
    })
    .catch((err) =>
      res.json(AppResponseDto.buildWithErrorMessages(err.message))
    );
};
