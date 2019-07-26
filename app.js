const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const expressValidator = require("express-validator");
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb://localhost/cg-desafio01', {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load Insumo Model
require('./models/Insumo');
const Insumo = mongoose.model('insumos');

// Load User Model
require('./models/User');
const User = mongoose.model('users');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Login Form Post
app.post('/', (req, res, next) =>{
  passport.authenticate('local', {
      successRedirect: '/insumos',
      failureRedirect: '/',
      failureFlash: true
  })(req, res, next);
});

app.get("/insumos", (req, res) => {
  res.sendFile(__dirname + "/views/insumo/addInsumos.html");
});

app.post("/insumos", (req, res) => {
  let errors = [];

  if (!req.body.nome) {
    errors.push("Adicione um nome !");
  }
  if (!req.body.categoria) {
    errors.push("Adicione uma categoria !");
  }
  if (!req.body.estoque) {
    errors.push("Adicione um valor para o estoque !");
  }
  if (!req.body.capacidade) {
    errors.push("Adicione uma capacidade !");
  }

  if (errors.length > 0) {
    console.log("Erro: " + errors);
  }
  else {
    const newInsumo = {
      nome: req.body.nome,
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      estoque: req.body.estoque,
      capacidade: req.body.capacidade
    }
    new Insumo(newInsumo)
      .save()
      .then(insumo => {
        res.redirect('/insumo');
      })
  }
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});