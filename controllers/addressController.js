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

exports.createAddress = async function (req, res, next) {
  const { first_name, last_name, zip_code, address, city, country, state } =
    req.body;

  const firstName = first_name || req.user.firstName;
  const lastName = last_name || req.user.lastName;

  const errors = {};

  // Custom error messages for validation
  // if (!firstName) errors.firstName = "First name is required";
  // if (!lastName) errors.lastName = "Last name is required";
  if (!zip_code) errors.zipCode = "Please provide a valid zip code.";
  if (!address) errors.address = "Address cannot be empty.";
  if (!city) errors.city = "City is a required field.";
  if (!country) errors.country = "Please select your country.";
  if (!state) errors.state = "State or region is required.";

  // Check if there are any validation errors
  if (Object.keys(errors).length > 0) {
    // Handle each validation error with a custom message
    return res.status(400).json({
      success: false,
      message: "Address validation failed.",
      errors: errors,
    });
  }

  try {
    // Save the new address to the database
    const newAddress = new Address({
      firstName,
      lastName,
      zipCode: zip_code,
      address,
      city,
      country,
      state,
      userId: req.user.id,
    });

    const savedAddress = await newAddress.save();

    // Return a success response with a custom message
    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address: AddressDto.buildDto(savedAddress),
    });
  } catch (err) {
    // Handle any server errors with a custom error message
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the address.",
      error: err.message,
    });
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.addressId;
    console.log(addressId);
    console.log(req.body);
    const { address, city, state, zip_code, country } = req.body;

    // Find the address by ID
    const foundAddress = await Address.findOne({
      where: { id: addressId },
    });

    if (!foundAddress) {
      return res.status(404).json({ message: "No Address found" });
    }

    if (req.user.id !== foundAddress.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update product fields
    if (address) foundAddress.address = address;
    if (city) foundAddress.city = city;
    if (state) foundAddress.state = state;
    if (zip_code) foundAddress.zipCode = zip_code;
    if (country) foundAddress.country = country;

    // Save the updated product
    await foundAddress.save();

    // Respond with the updated address (excluding the password)
    res.json({
      success: true,
      updatedAddress: foundAddress,
    });
  } catch (error) {
    console.error("Failed to update address:", error);
    res.status(500).json({ message: "Failed to update address", error });
  }
};
