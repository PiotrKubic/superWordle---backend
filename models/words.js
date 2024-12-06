const mongoose = require("mongoose");

const wordSchema = mongoose.Schema({
  word: { type: String, index: true },
  nbLetters: Number,
  lemma: String,
  type: String,
  diffScore: { type: Number, index: true },
});

const Word = mongoose.model("words", wordSchema);

module.exports = Word;
