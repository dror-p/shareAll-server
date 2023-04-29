const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
//user.provider
  // Convert empty fields to an empty string so we can use validator functions
  // data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  if(!data.provider){
    data.password = !isEmpty(data.password) ? data.password : "";
    if (Validator.isEmpty(data.password)) {
      errors.auth = "שדה ססמא נדרש";
    }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
      errors.auth = "ססמא חייבת להיות מינימום 6 תווים";
    }
  }
  // Name checks
  // if (Validator.isEmpty(data.name)) {
  //   errors.auth = "Name field is required";
  // }

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.auth = "שדה מייל נדרש";
  } else if (!Validator.isEmail(data.email)) {
    errors.auth = "מייל שהוזן לא תקין";
  }

  // Password checks


  // if (Validator.isEmpty(data.password2)) {
  //   errors.auth = "Confirm password field is required";
  // }



  // if (!Validator.equals(data.password, data.password2)) {
  //   errors.auth = "Passwords must match";
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
