// env variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express         = require('express');
const expressLayouts  = require('express-ejs-layouts');
const connectMongoDB  = require('./config/db');
const session         = require('express-session');
const flash           = require('connect-flash');
const passport        = require('passport');
const morgan          = require('morgan');

const app = express();
connectMongoDB();

//morgan
if (process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({ extended: false })); // express bodyparser
app.use(express.static('public'));
app.use(flash()); // connect-flash

// templating
app.use(expressLayouts);
app.set('view engine', 'ejs');

// express session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});