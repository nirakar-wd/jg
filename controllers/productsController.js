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
// exports.getAll = async function (req, res, next) {
//   const page = parseInt(req.query.page) || 1;
//   const pageSize = parseInt(req.query.pageSize) || 5;

//   try {
//     const product = await Product.findAndCountAll({
//       offset: 0,
//       limit: 5,
//       order: [
//         ["createdAt", "DESC"],
//         // ['price', 'DESC']
//       ],
//       attributes: [
//         "id",
//         "name",
//         "slug",
//         "description",
//         "vendor",
//         "price",
//         "discountedPrice",
//         "stock",
//         "features",
//         "created_at",
//         "updated_at",
//       ],
//       include: [
//         { model: Tag, attributes: ["id", "name"] },
//         { model: Category, attributes: ["id", "name"] },
//         { model: Collection, attributes: ["id", "name"] },
//       ],
//       offset: (page - 1) * pageSize,
//       limit: pageSize,
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     return res.status(200).json(product);
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal server error" });
//   }
// };

exports.getAll = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  Promise.all([
    Product.findAll({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [
        ["createdAt", "DESC"],
        // ['price', 'DESC']
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "price",
        "vendor",
        "stock",
        "discountedPrice",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Collection,
          exclude: ["description", "created_at", "updated_at"],
        },
        {
          model: Tag,
          exclude: ["description", "created_at", "updated_at"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    }),
    Product.findAndCountAll({ attributes: ["id"] }),
  ])
    .then((results) => {
      const products = results[0];
      const productsCount = results[1].count;

      // Fetch comments to calculate both comments count and average rating
      Comment.findAll({
        where: {
          productId: {
            [Op.in]: products.map((product) => product.id),
          },
        },
        attributes: [
          "productId",
          [sequelize.fn("COUNT", sequelize.col("id")), "commentsCount"],
          [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"], // Calculate average rating
        ],
        group: "productId",
      })
        .then((results) => {
          products.forEach((product) => {
            let commentData = results.find(
              (comment) => product.id === comment.productId
            );

            if (commentData != null) {
              product.comments_count = commentData.get("commentsCount");
              product.average_rating =
                parseFloat(commentData.get("averageRating")) || 0; // Set average rating
            } else {
              product.comments_count = 0;
              product.average_rating = 0; // Default if no ratings
            }
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
          res.json(AppResponseDto.buildWithErrorMessages(err.message));
        });
    })
    .catch((err) => {
      return res.status(400).send(err.message);
    });
};

// get product by id
exports.getProductById = async function (req, res, next) {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({
      where: { id: productId },
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "vendor",
        "price",
        "discountedPrice",
        "stock",
        "features",
        "created_at",
        "updated_at",
        [
          sequelize.literal(`(
            SELECT AVG(rating)
            FROM comments AS c
            WHERE c.productId = products.id
          )`),
          "averageRating",
        ],
      ],
      include: [
        { model: Tag, attributes: ["id", "name"] },
        { model: Category, attributes: ["id", "name"] },
        { model: Collection, attributes: ["id", "name"] },
        {
          model: Comment,
          attributes: ["id", "content", "rating"],
          include: [{ model: User, attributes: ["id", "username"] }],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

exports.getProductBySlug = async function (req, res, next) {
  try {
    const productSlug = req.params.slug;

    const product = await Product.findOne({
      where: { slug: productSlug },
      include: [
        { model: Tag, attributes: ["id", "name"] },
        { model: Category, attributes: ["id", "name"] },
        { model: Collection, attributes: ["id", "name"] },
        {
          model: Comment,
          attributes: ["id", "content"],
          include: [{ model: User, attributes: ["id", "username"] }],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.json(product);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "internal server error" });
  }
};

exports.searchProduct = async (req, res, next) => {
  try {
    const searchTerm = req.query.q; // Extract the search term from query parameters

    // Ensure searchTerm is not undefined or empty
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const products = await Product.findAll({
      where: {
        slug: {
          [Op.like]: "%" + searchTerm + "%", // Search products by slug
        },
        // You can add more conditions to search other fields if needed, e.g.:
        // name: {
        //   [Op.like]: "%" + searchTerm + "%",
        // },
        // description: {
        //   [Op.like]: "%" + searchTerm + "%",
        // }
      },
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json(products); // Return the search results
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getByTag = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page from query params or default to 1
    const pageSize = parseInt(req.query.pageSize) || 5; // Get the page size from query params or default to 5
    const offset = (page - 1) * pageSize; // Calculate offset for pagination

    const tagQuery = {};

    // Use slug if provided, otherwise use categoryId
    if (req.params.tag_slug) {
      tagQuery.slug = req.params.tag_slug;
    } else if (req.params.tagId) {
      tagQuery.id = req.params.tagId;
    }

    // Fetch products with related categories, tags, and comments
    const products = await Product.findAndCountAll({
      attributes: [
        "id",
        "name",
        "description",
        "vendor",
        "slug",
        "price",
        "discountedPrice",
        "stock",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Tag,
          where: tagQuery, // Filter by category based on the query
        },
        {
          model: Category,
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
        "description",
        "vendor",
        "slug",
        "price",
        "discountedPrice",
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
  console.log(req.files); // Debugging: logs uploaded files
  console.log(req.body); // Debugging: logs incoming form data

  const bindingResult = ProductRequestDto.createProductResponseDto(req);

  // If there are validation errors, return them
  if (!_.isEmpty(bindingResult.errors)) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(bindingResult.errors)
    );
  }

  let transaction;

  try {
    transaction = await sequelize.transaction({ autocommit: false });

    // Parse JSON strings into objects
    const tags = req.body.tags ? JSON.parse(req.body.tags[1]) : [];
    const categories = req.body.categories
      ? JSON.parse(req.body.categories[1])
      : [];
    const collections = req.body.collections
      ? JSON.parse(req.body.collections[1])
      : [];

    const promises = [];

    // Create or find tags
    tags.forEach(({ name, description }) => {
      promises.push(
        Tag.findOrCreate({
          where: { name },
          defaults: { description },
          transaction,
        })
      );
    });

    // Create or find categories
    categories.forEach(({ name, description }) => {
      promises.push(
        Category.findOrCreate({
          where: { name },
          defaults: { description },
          transaction,
        })
      );
    });

    // Create or find collections
    collections.forEach(({ name, description }) => {
      promises.push(
        Collection.findOrCreate({
          where: { name },
          defaults: { description },
          transaction,
        })
      );
    });

    // Create the product
    promises.push(Product.create(bindingResult.validatedData, { transaction }));

    // Execute all promises
    const results = await Promise.all(promises);

    // Separate the product and related items
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

    // Associate tags, categories, and collections with the product
    await Promise.all([
      product.setTags(createdTags, { transaction }),
      product.setCategories(createdCategories, { transaction }),
      product.setCollections(createdCollections, { transaction }),
    ]);

    // Handle file uploads
    if (req.files) {
      const filePromises = req.files.map((file) => {
        const filePath = file.path
          .replace(new RegExp("\\\\", "g"), "/")
          .replace("public", "");
        return ProductImage.create(
          {
            fileName: file.filename,
            filePath: filePath,
            originalName: file.originalname,
            fileSize: file.size,
            productId: product.id,
          },
          { transaction }
        );
      });

      const uploadedImages = await Promise.all(filePromises);
      product.images = uploadedImages;
    }

    // Commit the transaction
    await transaction.commit();

    // Respond with the created product
    return res.json(
      AppResponseDto.buildWithDtoAndMessages(
        ProductResponseDto.buildDto(product),
        "Product created successfully"
      )
    );
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    // Handle specific and general errors
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A product with the same unique attribute already exists.",
        errors: err.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
      errors: err.stack,
    });
  }
};

// Update Product
exports.updateProduct = async (req, res, next) => {
  console.log(req.files);
  try {
    const productId = req.params.productId;
    const {
      name,
      description,
      features,
      price,
      vendor,
      stock,
      discountedPrice,
    } = req.body;

    // Find the user by ID
    const product = await Product.findOne({
      where: { id: productId },
      include: [{ model: ProductImage, as: "images" }],
    });

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    if (req.files && req.files.length > 0) {
      // Delete the existing images from the database
      await ProductImage.destroy({ where: { productId: productId } });

      const filePromises = req.files.map((file) => {
        const filePath = file.path
          .replace(new RegExp("\\\\", "g"), "/")
          .replace("public", "");
        return ProductImage.create({
          fileName: file.filename,
          filePath: filePath,
          originalName: file.originalname,
          fileSize: file.size,
          productId: productId,
        });
      });

      const uploadedImages = await Promise.all(filePromises);
      product.images = uploadedImages;
    }

    // Update product fields
    if (name) product.name = name;
    if (name) product.slug = name;
    if (description) product.description = description;
    if (features) product.features = features;
    if (price) product.price = price;
    if (vendor) product.vendor = vendor;
    if (stock) product.stock = stock;
    if (discountedPrice) product.discountedPrice = discountedPrice;

    // Save the updated product
    await product.save();

    // Respond with the updated user (excluding the password)
    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        features: product.features,
        price: product.price,
        vendor: product.vendor,
        stock: product.stock,
        discountedPrice: product.discountedPrice,
        images: product.images, // Include the images in the response
      },
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    res.status(500).json({ message: "Failed to update product", error });
  }
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

exports.getFilteredProducts = async (req, res, next) => {
  try {
    const { sort, minPrice, maxPrice } = req.query;

    let order = [];
    let where = {};

    // Sorting logic
    if (sort) {
      switch (sort) {
        case "name_asc":
          order.push(["name", "ASC"]);
          break;
        case "name_desc":
          order.push(["name", "DESC"]);
          break;
        case "price_asc":
          order.push(["price", "ASC"]);
          break;
        case "price_desc":
          order.push(["price", "DESC"]);
          break;
        default:
          break;
      }
    }

    // Price filtering logic
    if (minPrice && maxPrice) {
      where.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      where.price = { [Op.gte]: minPrice };
    } else if (maxPrice) {
      where.price = { [Op.lte]: maxPrice };
    }

    // Fetch filtered and sorted products from the database
    const products = await Product.findAll({
      where,
      order,
      // include: [
      // { model: Tag, attributes: ["id", "name"] },
      // { model: Category, attributes: ["id", "name"] },
      // { model: Collection, attributes: ["id", "name"] },
      //   {
      //     model: Comment,
      //     attributes: ["id", "rating"],
      //     include: [{ model: User, attributes: ["id", "username"] }],
      //   },
      // ],
    });

    return res.status(200).json(products);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};
