const sequelize = require("../models/index").sequelize;
const Tag = require("../models/index").Tag;
const Category = require("../models/index").Category;
const Collection = require("../models/index").Collection;
const CategoryImage = require("../models/index").CategoryImage;
const Product = require("../models/index").Product;
const TagImage = require("../models/index").TagImage;
const TagDto = require("../dtos/responses/tagsDto");
const CategoryDto = require("../dtos/responses/categoriesDto");
const CollectionDto = require("../dtos/responses/collectionsDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");

exports.getTags = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 5;
  const offset = (page - 1) * pageSize;

  Tag.findAndCountAll({
    offset,
    limit: pageSize,
  })
    .then(function (tags) {
      return res.json(
        TagDto.buildPagedList(
          tags.rows,
          page,
          pageSize,
          tags.count,
          req.baseUrl
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.getCollections = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 5;
  const offset = (page - 1) * pageSize;

  Collection.findAndCountAll({
    offset,
    limit: pageSize,
  })
    .then(function (collections) {
      return res.json(
        CollectionDto.buildPagedList(
          collections.rows,
          page,
          pageSize,
          collections.count,
          req.baseUrl
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.getCategories = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  const offset = (page - 1) * pageSize;

  Category.findAndCountAll({
    offset,
    limit: pageSize,
  })
    .then(function (categories) {
      return res.json(
        CategoryDto.buildPagedList(
          categories.rows,
          page,
          pageSize,
          categories.count,
          req.baseUrl
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.getCategoryById = function (req, res, next) {
  const categoryId = req.params.categoryId;

  Category.findByPk(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json({
        category,
      });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving category" });
    });
};

exports.getTagById = function (req, res, next) {
  const tagId = req.params.tagId;

  Tag.findByPk(tagId)
    .then((tag) => {
      if (!tag) {
        return res.status(404).json({ message: "tag not found" });
      }
      return res.status(200).json({
        tag,
      });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving tag" });
    });
};

exports.getCollectionById = function (req, res, next) {
  const collectionId = req.params.collectionId;

  Collection.findByPk(collectionId)
    .then((collection) => {
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      return res.status(200).json({
        collection,
      });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving collection" });
    });
};

exports.createTag = function (req, res, next) {
  const tagObj = {};
  const promises = [];

  console.log(req.body);

  if (req.body.name) {
    tagObj.name = req.body.name;
  }

  if (req.body.description) {
    tagObj.description = req.body.description;
  }

  if (tagObj.name == null) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "You must provide the name for the category"
      )
    );
  }
  let transac = undefined;
  sequelize
    .transaction({ autocommit: false })
    .then(function (transaction) {
      transac = transaction;
      Tag.create(tagObj, { transaction })
        .then(async (tag) => {
          for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp("\\\\", "g"), "/");
            filePath = filePath.replace("public", "");
            promises.push(
              TagImage.create(
                {
                  fileName: file.filename,
                  filePath: filePath,
                  originalName: file.originalname,
                  fileSize: file.size,
                  tagId: tag.id,
                },
                { transaction: transaction }
              )
            );
          }

          Promise.all(promises)
            .then((results) => {
              tag.images = results;
              transaction.commit();
              return res.json(
                AppResponseDto.buildWithDtoAndMessages(
                  TagDto.buildDto(tag, true),
                  "Tag created successfully"
                )
              );
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      transac.rollback();
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.createCategory = function (req, res, next) {
  const categoryObj = {};
  const promises = [];
  if (req.body.name) {
    categoryObj.name = req.body.name;
  }

  if (req.body.description) {
    categoryObj.description = req.body.description;
  }

  if (categoryObj.name == null) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "You must provide the name for the category"
      )
    );
  }
  let transac = undefined;
  sequelize
    .transaction({ autocommit: false })
    .then(function (transaction) {
      transac = transaction;
      Category.create(categoryObj, { transaction })
        .then(async (category) => {
          for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp("\\\\", "g"), "/");
            filePath = filePath.replace("public", "");
            promises.push(
              CategoryImage.create(
                {
                  fileName: file.filename,
                  filePath: filePath,
                  originalName: file.originalname,
                  fileSize: file.size,
                  categoryId: category.id,
                },
                { transaction }
              )
            );
          }

          Promise.all(promises)
            .then((results) => {
              category.images = results;
              transaction.commit();
              return res.json(
                AppResponseDto.buildWithDtoAndMessages(
                  CategoryDto.buildDto(category, true),
                  "Category created successfully"
                )
              );
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      transac.rollback();
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.createCollections = async (req, res, next) => {
  const collectionObj = {};
  const promises = [];
  if (req.body.name) {
    collectionObj.name = req.body.name;
  }

  if (req.body.description) {
    collectionObj.description = req.body.description;
  }

  if (collectionObj.name == null) {
    return res.json(
      AppResponseDto.buildWithErrorMessages(
        "You must provide the name for the collection"
      )
    );
  }
  let transac = undefined;
  sequelize
    .transaction({ autocommit: false })
    .then(function (transaction) {
      transac = transaction;
      Collection.create(collectionObj, { transaction })
        .then(async (collection) => {
          for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp("\\\\", "g"), "/");
            filePath = filePath.replace("public", "");
          }

          Promise.all(promises)
            .then((results) => {
              // collection.images = results;
              transaction.commit();
              return res.json(
                AppResponseDto.buildWithDtoAndMessages(
                  CollectionDto.buildDto(collection, true),
                  "Collection created successfully"
                )
              );
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      transac.rollback();
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.updateCategoryById = function (req, res, next) {
  const categoryId = req.params.categoryId;
  const { name, description } = req.body;

  Category.findByPk(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      category
        .update({ name, description })
        .then((updatedCategory) => {
          return res.status(200).json({ updatedCategory });
        })
        .catch((err) => {
          return res.status(500).json({ message: "error updating category" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving category" });
    });
};

exports.updateTagById = function (req, res, next) {
  const tagId = req.params.tagId;
  const { name, description } = req.body;

  Tag.findByPk(tagId)
    .then((tag) => {
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }

      tag
        .update({ name, description })
        .then((updatedTag) => {
          return res.status(200).json({ updatedTag });
        })
        .catch((err) => {
          return res.status(500).json({ message: "error updating tag" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving tag" });
    });
};

exports.updateCollectionById = function (req, res, next) {
  const collectionId = req.params.collectionId;
  const { name, description } = req.body;

  Collection.findByPk(collectionId)
    .then((collection) => {
      if (!collection) {
        return res.status(404).json({ message: "collection not found" });
      }

      collection
        .update({ name, description })
        .then((updatedCollection) => {
          return res.status(200).json({ updatedCollection });
        })
        .catch((err) => {
          return res.status(500).json({ message: "error updating collection" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ message: "error retrieving collection" });
    });
};

exports.deleteCategoryById = function (req, res, next) {
  const categoryId = req.params.id;

  Category.findByPk(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(404).json({message: "category not found"});
      }

      category.destroy()
        .then(() => {
          return res.status(200).json({message: "category deleted successfully"});
        })
        .catch((err) => {
          return res.status(500).json({message: "Error deleting category"});
        });
    })
    .catch((err) => {
      return res.status(500).json({message: "Error retrieving category"});
    });
};

exports.deleteTagById = function (req, res, next) {
  const tagId = req.params.id;

  Tag.findByPk(tagId)
    .then((tag) => {
      if (!tag) {
        return res.status(404).json({message: "tag not found"});
      }

      tag.destroy()
        .then(() => {
          return res.status(200).json({message: "tag deleted successfully"});
        })
        .catch((err) => {
          return res.status(500).json({message: "Error deleting tag"});
        });
    })
    .catch((err) => {
      return res.status(500).json({message: "Error retrieving tag"});
    });
};

exports.deleteCollectionById = function (req, res, next) {
  const collectionId = req.params.id;

  Collection.findByPk(collectionId)
    .then((collection) => {
      if (!collection) {
        return res.status(404).json({message: "Collection not found"});
      }

      collection.destroy()
        .then(() => {
          return res.status(200).json({message: "Collection deleted successfully"});
        })
        .catch((err) => {
          return res.status(500).json({message: "Error deleting collection"});
        });
    })
    .catch((err) => {
      return res.status(500).json({message: "Error retrieving collection"});
    });
};

