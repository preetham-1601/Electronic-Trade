const morgan = require("morgan");
const express = require("express");
const methodOverride = require("method-override");
const mongoose = require('mongoose')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const tradeRoutes = require('./routes/tradeRoutes')
const mainRoutes = require('./routes/mainRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

let port = 8080;
let host = "localhost";
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true }));

mongoose.connect('mongodb://localhost:27017/milestone10', 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err));

app.use(
  session({
      secret: "ajfeirf90aeu9eroejfoefj",
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/milestone10'}),
      cookie: {maxAge: 60*60*1000}
      })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user||null;
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  next();
});

app.use('/', mainRoutes)

app.use("/trades", tradeRoutes);

app.use('/users', userRoutes);

app.use((req,res,next)=>{
  let err = new Error('The server cannot locate'+req.url)
  err.status = 404
  next(err)
})



app.use((err, req, res, next) => {
  console.log(err.stack);
  if(!err.status){
    console.log(err.stack)
    err.status = 500
    err.message = "Internal Server error"
  }
  res.status = err.status
  res.render('error',{error:err})
});


