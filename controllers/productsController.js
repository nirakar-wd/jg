const _ = require("lodash");
const { Op } = require("sequelize");
const sequelize = require("../models/index").sequelize;
const Product = require("../models/index").Product;
const ProductTag = require("../models/index").ProductTag;
const Tag = require("../models/index").Tag;
const ProductImage = require("../models/index").ProductImage;
const Category = require("../models/index").Category;
const Collection = require("../models/index").Collection;
const Comment = require("../models/index").Comment;
const User = require("../models/index").User;

const AppResponseDto = require("./../dtos/responses/appResponseDto");
const ProductRequestDto = require("./../dtos/requests/productsDto");
const ProductResponseDto = require("./../dtos/responses/productsDto");
// const CommentModel = require("../models/CommentModel");

// Get All Products
exports.getAll = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  Promise.all([
    Product.findAll({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "price",
        "stock",
        "created_at",
        "updated_at",
      ],
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
            [Op.in]: products.map((product) => product.id),
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
exports.getByIdOrSlug = function (req, res, next) {
  console.log(req.query);
  const query = _.assign(req.query, {
    include: [
      {
        model: Tag,
        attributes: ["id", "name"],
      },
      {
        model: Category,
        attributes: ["id", "name"],
      },
      {
        model: Collection,
        attributes: ["id", "name"],
      },
      {
        model: Comment,
        attributes: ["id", "content"],
        include: [{ model: User, attributes: ["id", "username"] }],
      },
    ],
  });

  Product.findOne(req.query)
    .then((product) => {
      return res.json(ProductResponseDto.buildDetails(product, true, false));
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
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
              [Op.in]: productIds,
            },
          },
          include: [Tag, Category],
        }),
        Comment.findAll({
          where: {
            productId: {
              [Op.in]: productIds,
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

exports.getByCategory = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page from query params or default to 1
    const pageSize = parseInt(req.query.pageSize) || 5; // Get the page size from query params or default to 5
    const offset = (page - 1) * pageSize; // Calculate offset for pagination

    const categoryQuery = {};

    // Use slug if provided, otherwise use categoryId
    if (req.params.category_slug) {
      categoryQuery.slug = req.params.category_slug;
    } else if (req.params.categoryId) {
      categoryQuery.id = req.params.categoryId;
    }

    // Fetch products with related categories, tags, and comments
    const products = await Product.findAndCountAll({
      attributes: [
        "id",
        "name",
        "slug",
        "price",
        "stock",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Category,
          where: categoryQuery, // Filter by category based on the query
        },
        {
          model: Tag,
          attributes: { exclude: ["description", "created_at", "updated_at"] }, // Exclude unnecessary fields
        },
        {
          model: Comment,
          attributes: ["id", "rating", "productId"],
        },
      ],
      order: [["createdAt", "DESC"]], // Order by creation date descending
      offset, // Pagination offset
      limit: pageSize, // Number of items per page
    });

    // Build paginated response
    const response = ProductResponseDto.buildPagedList(
      products.rows, // The actual product data
      page, // Current page
      pageSize, // Page size
      products.count, // Total number of products
      req.baseUrl // Base URL for pagination links
    );

    return res.json(response);
  } catch (err) {
    // Handle errors and return an appropriate error message
    return res.json(AppResponseDto.buildWithErrorMessages(err.message));
  }
};

exports.createProduct = async (req, res) => {
  console.log(req.body);

  console.log(req.files);

  const bindingResult = ProductRequestDto.createProductResponseDto(req);
  console.log(bindingResult);
  const promises = [];

  if (!_.isEmpty(bindingResult.errors)) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(bindingResult.errors)
    );
  }

  let transaction;

  try {
    transaction = await sequelize.transaction({ autocommit: false });

    const tags = req.body.tags || [];
    const categories = req.body.categories || [];
    const collections = req.body.collections || [];

    tags.forEach(({ name, description }) => {
      promises.push(
        Tag.findOrCreate({ where: { name }, defaults: { description } })
      );
    });

    categories.forEach(({ name, description }) => {
      promises.push(
        Category.findOrCreate({ where: { name }, defaults: { description } })
      );
    });

    collections.forEach(({ name, description }) => {
      promises.push(
        Collection.findOrCreate({ where: { name }, defaults: { description } })
      );
    });

    promises.push(Product.create(bindingResult.validatedData, { transaction }));

    const results = await Promise.all(promises);

    promises.length = 0;
    const product = results.pop();
    const createdTags = [];
    const createdCategories = [];
    const createdCollections = [];

    results.forEach((result) => {
      if (result[0].constructor.getTableName() === "tags") {
        createdTags.push(result[0]);
      } else if (result[0].constructor.getTableName() === "categories") {
        createdCategories.push(result[0]);
      } else if (result[0].constructor.getTableName() === "collections") {
        createdCollections.push(result[0]);
      }
    });

    promises.push(product.setTags(createdTags, { transaction }));
    promises.push(product.setCategories(createdCategories, { transaction }));
    promises.push(product.setCollections(createdCollections, { transaction }));

    if (req.files) {
      console.log(req.files);
      req.files.forEach((file) => {
        const filePath = file.path
          .replace(new RegExp("\\\\", "g"), "/")
          .replace("public", "");
        promises.push(
          ProductImage.create(
            {
              fileName: file.filename,
              filePath: filePath,
              originalName: file.originalname,
              fileSize: file.size,
              productId: product.id,
            },
            { transaction }
          )
        );
      });
    }

    const finalResults = await Promise.all(promises);
    const images = finalResults.filter(
      (result) =>
        result.constructor.getTableName &&
        result.constructor.getTableName() === "file_uploads"
    );

    product.images = images;
    product.tags = createdTags;
    product.categories = createdCategories;
    product.collections = createdCollections;

    await transaction.commit();
    return res.json(
      AppResponseDto.buildWithDtoAndMessages(
        ProductResponseDto.buildDto(product),
        "Product created successfully"
      )
    );
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "A product with the same unique attribute already exists.",
        errors: err.errors,
      });
    }
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
      errors: err.stack,
    });
  }
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
  req.product
    .destroy(req.query)
    .then((result) => {
      res.json(
        AppResponseDto.buildSuccessWithMessages("Product deleted successfully")
      );
    })
    .catch((err) => {
      res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.sortProducts = async (req, res, next) => {
  try {
    const {
      sortBy = "name",
      order = "asc",
      minPrice = 0,
      maxPrice = Infinity,
    } = req.query;

    // Validate inputs
    if (!["name", "price"].includes(sortBy)) {
      return res
        .status(400)
        .json({ error: 'Invalid sort column. Use "name" or "price".' });
    }

    if (!["asc", "desc"].includes(order)) {
      return res
        .status(400)
        .json({ error: 'Invalid order. Use "asc" or "desc".' });
    }

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ error: "Invalid price range." });
    }

    // Convert minPrice and maxPrice to numbers
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    // Fetch products with filtering and sorting
    const products = await Product.findAll({
      where: {
        price: {
          [Op.between]: [min, max], // Filter by price range
        },
      },
      order: [
        [sortBy, order], // Sort by the specified column and order
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
