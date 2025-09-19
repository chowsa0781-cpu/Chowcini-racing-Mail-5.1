const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'chowcini-secret',
  resave: false,
  saveUninitialized: true
}));

// Middleware for role-based access
function checkRole(role) {
  return (req, res, next) => {
    if (req.session.role === role) {
      next();
    } else {
      res.status(403).send('Access Denied');
    }
  };
}

// Routes
app.get('/', (req, res) => res.render('index', { user: req.session.user, role: req.session.role }));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const { username, role } = req.body;
  req.session.user = username;
  req.session.role = role;

  if (role === 'Standard') return res.redirect('/dashboard');
  if (role === 'VIP') return res.redirect('/vip');
  if (role === 'Admin') return res.redirect('/admin');
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/dashboard', (req, res) => {
  if (req.session.role === 'Standard' || req.session.role === 'VIP') {
    return res.render('dashboard', { user: req.session.user });
  }
  res.status(403).send('Access Denied');
});

app.get('/vip', checkRole('VIP'), (req, res) => res.render('vip', { user: req.session.user }));

app.get('/admin', checkRole('Admin'), (req, res) => res.render('admin', { user: req.session.user }));
app.get('/admin/tips', checkRole('Admin'), (req, res) => res.render('admin-tips', { user: req.session.user }));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
