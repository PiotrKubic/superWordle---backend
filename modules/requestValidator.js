const { validationResult, query } = require("express-validator");
const rules = require("../config/rules.json");

const validateQuery = [
  query().custom((value, { req }) => {
    const allowedParams = ["nbletters", "difficulty"];
    const invalidParams = Object.keys(req.query).filter(
      (key) => !allowedParams.includes(key)
    );
    if (invalidParams.length > 0) {
      throw new Error(`Invalid parameters: ${invalidParams.join(", ")}`);
    }
    return true;
  }),

  // query().custom((value, { req }) => {
  //   if (!req.query.nbletters && !req.query.difficulty) {
  //     throw new Error("Either nbletters or difficulty must be provided");
  //   }
  //   return true;
  // }),

  // Validate 'nbletters' if provided (it should be a number)
  query("nbletters")
    .optional()
    .escape()
    .isNumeric()
    .withMessage("nbletters must be a number")
    .bail()
    .custom((value) => {
      if (value < rules.minLetters || value > rules.maxLetters) {
        throw new Error(
          `nbletters must be between ${rules.minLetters} and ${rules.maxLetters} `
        );
      }
      return true;
    }),

  // Validate 'difficulty' if provided (it should be a string)
  query("difficulty")
    .optional()
    .escape()
    .isAlpha()
    .withMessage("difficulty must be a string")
    .bail()
    .custom((value) => {
      const authorizedValues = ["easy", "medium", "hard"];
      if (!authorizedValues.includes(value)) {
        throw new Error("difficulty must be easy, medium or hard");
      }
      return true;
    })
    .bail(),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { handleValidationErrors, validateQuery };
