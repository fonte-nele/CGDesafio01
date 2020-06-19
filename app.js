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

app.get('/', (req, res) => {
  res.render('users/register');
});

app.post('/', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Passwords do not match' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Passwords must be at least 4 characters' });
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      //password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered');
          res.send('Fail');
          //res.redirect('users/register');
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
          //console.log(newUser);
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('sucess_msg', 'You are now register and can log in');
                  req.send(201);
                  //res.redirect('/login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
            });

          });
        }
      });
  }
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
  //res.sendStatus(200);
});

// Login Form Post
app.post("/login", (req, res, next) => {

  passport.authenticate('local', {
    successRedirect: '/insumos',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

app.get("/insumos", (req, res) => {
  res.sendFile(__dirname + "/views/insumo/addInsumos.html");
  //res.send('Ok! Pagina de Insumos');
  //res.redirect('/insumos');
});

app.post("/insumos", (req, res) => {
  let errors = [];

  if (!req.body.nome) {
    errors.push("Sem nome. Favor adicionar!");
  }
  if (!req.body.categoria) {
    errors.push("Sem categoria. Favor adicionar!");
  }
  if (!req.body.estoque || req.body.estoque != 0) {
    errors.push("Sem estoque. Favor adicionar!");
  }
  if (!req.body.capacidade || req.body.capacidade != 0) {
    errors.push("Sem capacidade. Favor adicionar!");
  }

  if (errors.length > 0) {
    console.log("Erro: " + errors),
      res.send('Error');
    /*res.render('/insumos', {
      errors: errors,
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      estoque: req.body.estoque,
      capacidade: req.body.capacidade
    });*/
  }
  else {
    const newInsumo = {
      nome: req.body.nome,
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      estoque: req.body.estoque,
      capacidade: req.body.capacidade
      //user: req.user.id
    }
    new Insumo(newInsumo)
      .save()
      .then(insumo => {
        console.log('sucesso'),
          res.send('Insumo cadastrado com sucesso.');
        //res.redirect('/insumos');
      })
  }
});

// Edit Insumo
app.put('/insumos/:id', (req, res) => {
  Insumo.findOne({
    _id: req.params.id
  })
    .then(insumo => {
      // new values
      insumo.nome = req.body.nome,
        insumo.categoria = req.body.categoria,
        insumo.descricao = req.body.descricao,
        insumo.estoque = req.body.estoque,
        insumo.capacidade = req.body.capacidade

      insumo.save()
        .then(insumo => {
          req.flash('success_msg', 'Insumo atualizado');
          res.redirect('/insumos');
          //res.send('Ok! Insumo editado com sucesso.');
        })
    });
});

// Delete Insumo
app.delete('/insumos/:id', (req, res) => {
  Insumo.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Insumo removido');
      res.redirect('/insumos');
      //res.send('Ok! Insumo excluido com sucesso');
    });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});