
const mongoose = require('mongoose');


const tradeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true,"title is required"],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [50, 'Title cannot be longer than 50 characters'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: [true,"category is required"]
    },
  details: {
    type: String,
    required: [true,"details is required"],
    minlength: [10, 'Details must be at least 10 characters long'],
  },
  Status: {
    type: String,
    required: [true,"status is required"]
     },
  image: {
    type: String,
    required: [true,"image is required"],
    
  },
  tradeOffered: { type: Boolean },
  Saved: { type: Boolean },
  offerName: { type: String }

}, { timestamps: { createdAt: 'createdDate',updatedAt: 'updatedDate' }})

const Trade = mongoose.model('trade', tradeSchema)

module.exports = Trade