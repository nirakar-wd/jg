exports.createProductResponseDto = (req) => {
  const bindingResult = {
    validatedData: {},
    errors: {},
  };

  if (req.body.name) {
    bindingResult.validatedData.name = req.body.name;
  } else {
    bindingResult.errors.name = "You must provide a valid name";
  }

  if (req.body.description) {
    bindingResult.validatedData.description = req.body.description;
  } else {
    bindingResult.errors.description = "You must provide a valid description";
  }
  if (req.body.price) {
    bindingResult.validatedData.price = req.body.price;
  } else {
    bindingResult.errors.price = "You must provide a valid price";
  }
  if (req.body.vendor) {
    bindingResult.validatedData.vendor = req.body.vendor;
  } else {
    bindingResult.errors.price = "You must provide a vendor name";
  }
  if (req.body.stock) {
    bindingResult.validatedData.stock = req.body.stock;
  } else {
    bindingResult.errors.stock =
      "You must provide a stock value for this product";
  }
  if (req.body.features) {
    bindingResult.validatedData.features = req.body.features;
  } else {
    bindingResult.errors.features =
      "You must provide features for this product";
  }
  if (req.body.discounted_price) {
    bindingResult.validatedData.discounted_price = req.body.discounted_price;
  } else {
    bindingResult.errors.discounted_price =
      "You must provide discounted price for this product";
  }
  return bindingResult;
};
