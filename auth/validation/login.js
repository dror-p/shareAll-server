const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(data) {

  let errors = {};
  if(!data.provider){
    if (!data.email || !data.password) {
      errors.auth = "התחברות לא תקינה";
    }
    // Convert empty fields to an empty string so we can use validator functions
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";

    // Email checks
    if (Validator.isEmpty(data.email)) {
      errors.auth = "שדה מייל נדרש";
    } else if (!Validator.isEmail(data.email)) {
      errors.auth = "מייל שהוזן לא תקין";
    }
    // Password checks
    if (Validator.isEmpty(data.password)) {
      errors.auth = "שדה ססמא נדרש";
    }
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};
