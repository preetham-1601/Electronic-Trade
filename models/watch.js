const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchSchema = new Schema({
    userID: {type: Schema.Types.ObjectId, ref: 'User'},
    tradeId: {type: Schema.Types.ObjectId, ref: 'trade'} 
}
);

module.exports =  mongoose.model('Watch',watchSchema)