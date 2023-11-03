const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offerTradeschema = new Schema({
  Name: { type: String, required: [true, "ItemName is required"] },
  Status: { type: String },
  Category: { type: String, required: [true, "Item Category is required"] },
  SavedBy: { type: Schema.Types.ObjectId, ref: "user" }
  
});

const offerItem = mongoose.model("offer", offerTradeschema);

module.exports = offerItem;
