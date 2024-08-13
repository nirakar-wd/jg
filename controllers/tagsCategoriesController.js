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
  const pageSize = parseInt(req.query.page_size) || 5;
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

exports.createTag = function (req, res, next) {
  const tagObj = {};
  const promises = [];
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
