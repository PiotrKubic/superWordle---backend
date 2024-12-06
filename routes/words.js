var express = require("express");
var router = express.Router();
const {
  validateQuery,
  handleValidationErrors,
} = require("../modules/requestValidator.js");
const Word = require("../models/words.js");
const rules = require("../config/rules.json");

router.get(
  "/",
  [...validateQuery, handleValidationErrors],
  async (req, res) => {
    const { nbletters, difficulty } = req.query;
    const pipeline = [
      {
        $match: {
          ...(!rules.hyphenatedWords && { word: { $not: /[ -]/ } }),
          ...(nbletters
            ? { nbLetters: { $eq: parseInt(nbletters) } }
            : {
                nbLetters: { $gte: rules.minLetters, $lte: rules.maxLetters },
              }),
          ...(difficulty && {
            diffScore: { $in: rules.difficultyCurve[difficulty] },
          }),
        },
      },
      {
        $sample: { size: 1 },
      },
    ];
    try {
      const word = await Word.aggregate(pipeline);
      if (word.length === 0) {
        return res.status(400).json({ result: "false", word: "No word found" });
      }
      return res.json({ result: "true", word: word[0] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }
);

module.exports = router;
