const dbConfig = require("../config/db.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT, // Add the port here
  dialect: dbConfig.dialect,
  // operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected..");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("../models/UserModel.js")(sequelize, Sequelize);
db.UserRole = require("../models/UserRoleModel.js")(sequelize, Sequelize);
db.Role = require("../models/RoleModel.js")(sequelize, Sequelize);

db.Address = require("../models/AddressModel.js")(sequelize, Sequelize);
db.Product = require("../models/ProductModel.js")(sequelize, Sequelize);
db.Comment = require("../models/CommentModel.js")(sequelize, Sequelize);

db.Order = require("../models/OrderModel.js")(sequelize, Sequelize);
db.OrderItem = require("../models/OrderItemModel.js")(sequelize, Sequelize);

db.FileUpload = require("../models/FileUploadModel.js")(sequelize, Sequelize);
db.ProductImage = require("../models/ProductImageModel.js")(
  sequelize,
  Sequelize
);
db.UserImage = require("../models/UserImageModel.js")(
  sequelize,
  Sequelize
);

db.Tag = require("../models/TagModel.js")(sequelize, Sequelize);
db.Collection = require("../models/CollectionModel.js")(sequelize, Sequelize);
db.ProductTag = require("../models/ProductTagModel.js")(sequelize, Sequelize);
db.TagImage = require("../models/TagImageModel.js")(sequelize, Sequelize);

db.Category = require("../models/CategoryModel.js")(sequelize, Sequelize);
db.ProductCategory = require("../models/ProductCategoryModel.js")(
  sequelize,
  Sequelize
);
db.ProductCollection = require("../models/ProductCollectionModel.js")(
  sequelize,
  Sequelize
);
db.CategoryImage = require("../models/CategoryImageModel.js")(
  sequelize,
  Sequelize
);
db.Payment = require("../models/PaymentModel.js")(
  sequelize,
  Sequelize
);
db.Feedback = require("../models/FeedbackModel.js")(
  sequelize,
  Sequelize
);

db.User.associate(db);
db.Role.associate(db);
db.UserRole.associate(db);

db.Address.associate(db);

db.Tag.associate(db);
db.Category.associate(db);
db.Collection.associate(db);

db.FileUpload.associate(db);
db.CategoryImage.associate(db);
db.TagImage.associate(db);
db.ProductImage.associate(db);
db.UserImage.associate(db);


db.Product.associate(db);
db.Comment.associate(db);

db.Order.associate(db);
db.OrderItem.associate(db);
db.Payment.associate(db);
db.Feedback.associate(db);

// db.sequelize.sync({ force: false }).then(() => {
//   console.log("yes re-sync done!");
// });

module.exports = db;
