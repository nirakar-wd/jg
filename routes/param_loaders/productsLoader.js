const { Product } = require("../../models/index");
const AppResponseDto = require("./../../dtos/responses/appResponseDto");

function init(router) {
  // Preload product objects on routes with ':product_slug'
  router.param("product_slug", (req, res, next, slug) => {
    req.query = { slug: slug };
    next();
  });

  // Place the product in the request object when :productId is present in the path
  router.param("productId", (req, res, next, id) => {
    req.query = { id: id };
    next();
  });

  router.param("product_load_ids", async (req, res, next, slugOrId) => {
    const query = { attributes: ["id"] };

    if (isNaN(slugOrId)) {
      query.where = { slug: slugOrId };
    } else {
      query.where = { id: slugOrId };
    }

    try {
      const product = await Product.findOne(query);

      if (product) {
        req.product = product;
        req.product_id = product.id;
        return next();
      } else {
        return res
          .status(404)
          .json(
            AppResponseDto.buildWithErrorMessages("Product does not exist")
          );
      }
    } catch (err) {
      return res
        .status(500)
        .json(AppResponseDto.buildWithErrorMessages(err.message));
    }
  });
}

module.exports = {
  init,
};
