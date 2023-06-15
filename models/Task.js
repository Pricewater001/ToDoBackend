const { model, Schema } = require('mongoose');
const mongoose = require('mongoose');


const taskSchema = new Schema({
  name: String,
  description: String,
  createdAt: String,
  isDone: Boolean,
  
  createdBy: {
     type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
});

module.exports = model('Task', taskSchema);
