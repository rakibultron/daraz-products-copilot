const mongoose = require("mongoose");
const { ObjectId } = require("mongoose");
const { sub, add, toDate, format, parseISO } = require("date-fns");
const Schema = mongoose.Schema;

const ProductSchema = Schema(
  {
    productTitle: mongoose.Schema.Types.String,
    image: mongoose.Schema.Types.String,
    description: mongoose.Schema.Types.String,
    currentPrice: mongoose.Schema.Types.String,
    productUuid: mongoose.Schema.Types.String,
  },
  { timeStamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
