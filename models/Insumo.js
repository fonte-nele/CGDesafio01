const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const InsumoSchema = new Schema({
  nome:{
    type: String,
    required: true
  },
  categoria:{
    type: String,
    required: true
  },
  descricao:{
    type: String,
    required: true
  },
  estoque:{
    type: Number,
    required: true
  },
  capacidade:{
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('insumos', InsumoSchema);