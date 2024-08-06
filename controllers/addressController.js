const AddressDto = require("../dtos/responses/addressDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");
const Address = require("../models/index").Address;
const _ = require("lodash");

exports.getAddresses = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 5;
  const offset = (page - 1) * pageSize;

  Address.findAndCountAll({
    where: { userId: req.user.id },
    offset,
    limit: pageSize,
  })
    .then(function (addresses) {
      return res.json(
        AddressDto.buildPagedList(
          addresses.rows,
          page,
          pageSize,
          addresses.count,
          req.baseUrl
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createAddress = function (req, res, next) {
  const errors = {};

  const firstName = req.body.first_name || req.user.firstName;
  const lastName = req.body.last_name || req.user.lastName;
  const zipCode = req.body.zip_code;
  const address = req.body.address;
  const city = req.body.city;
  const country = req.body.country;

  if (!city || city.trim() === "") errors.firstName = "city is required";

  if (!country || country.trim() === "")
    errors.lastName = "country is required";

  if (!zipCode || zipCode.trim() === "") errors.email = "zipCode is required";

  if (!address || address.trim() === "")
    errors.password = "Password must not be empty";

  if (!_.isEmpty(errors)) {
    return res.status(422).json(AppResponseDto.buildWithErrorMessages(errors));
  }

  new Address({
    firstName: firstName,
    lastName: lastName,
    city,
    country,
    address,
    zipCode,
    user: req.user,
  })
    .save()
    .then((address) => {
      return res.json(
        AppResponseDto.buildWithDtoAndMessages(
          AddressDto.buildDto(address),
          "Address added successfully"
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};
