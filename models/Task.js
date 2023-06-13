const { model, Schema } = require('mongoose');
const mongoose = require('mongoose');


const taskSchema = new Schema({
  name: String,
  description: String,
  createdAt: String,
  idDone: Number,
  
  createdBy: {
     type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Task', taskSchema);
