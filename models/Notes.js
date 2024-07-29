const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    tite: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "General"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Notes = mongoose.model('Notes', notesSchema);
  
  module.exports = Notes;