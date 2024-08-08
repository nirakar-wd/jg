const sanitizeInput = require("../../helpers/sanitize").sanitizeInput;

exports.createUserRequestDto = (body) => {
  const resultBinding = {
    validatedData: {},
    errors: {},
  };

  // Regex to validate email
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // Password regex pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Check for first name
  if (!body.first_name || body.first_name.trim() === "")
    resultBinding.errors.firstName = "First name is required";
  else resultBinding.validatedData.firstName = sanitizeInput(body.first_name);

  // Check for last name
  if (!body.last_name || body.last_name.trim() === "")
    resultBinding.errors.lastName = "Last name is required";
  else resultBinding.validatedData.lastName = sanitizeInput(body.last_name);

  // Check for username
  if (!body.username || body.username.trim() === "")
    resultBinding.errors.username = "Username is required";
  else resultBinding.validatedData.username = sanitizeInput(body.username);

    // Check for phone
    if (!body.phone || body.phone.trim() === "")
      resultBinding.errors.phone = "Phone number is required";
    else resultBinding.validatedData.phone = sanitizeInput(body.phone);

  // Validate email
  if (
    body.email &&
    body.email.trim() !== "" &&
    emailRegex.test(String(body.email).toLowerCase())
  )
    resultBinding.validatedData.email = sanitizeInput(body.email.toLowerCase());
  else resultBinding.errors.email = "A valid email is required";

  // Validate password
  if (!body.password || body.password.trim() === "") {
    resultBinding.errors.password = "Password must not be empty";
  } else {
    const password = body.password.trim();
    if (!passwordRegex.test(password)) {
      resultBinding.errors.password =
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    } else {
      resultBinding.validatedData.password = password;
    }
  }

  // Validate password confirmation
  if (
    body.password_confirmation &&
    body.password_confirmation.trim() !== "" &&
    body.password_confirmation === body.password
  )
    resultBinding.validatedData.password_confirmation =
      body.password_confirmation;
  else
    resultBinding.errors.password_confirmation =
      "Confirmation password must not be empty and must match the password";

  return resultBinding;
};
