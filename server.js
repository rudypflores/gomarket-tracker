const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const initializePassport = require('./passport-config');
const usuario = require('./routes/usuario');
const dashboard = require('./routes/dashboard');


// Static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/images'));

// EJS
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");

// Middleware
app.use(cookieParser());	 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'gomarket',
    resave: false,
    saveUninitialized: false
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    next();
});

// Routers
app.use('/usuario', usuario);
app.use('/dashboard', dashboard);

// Default routes
app.get('/', (req,res) => {
    res.render('index');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/register', (req,res) => {
    res.render('register');
});

app.get('/pagos', (req,res) => {
    res.render('pagos', { total: req.query.total });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: "/login",
    failureFlash: false
}));

// Run Server
app.listen(5000, () => {
    console.log('Server started on port 5000');
});