const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files like CSS, JS, and images
app.use(express.static(path.join(__dirname, 'public')));

// Body parser for form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // Set session expiration time (e.g., 1 minute)
}));

// Mock user data (now includes an 8-digit verification code and role)
const users = [
  { verificationCode: '12345678', role: 'UiUx' },
  { verificationCode: '23456789', role: 'Full Project' },
  { verificationCode: '34567890', role: 'student' },
];

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    // Store the requested URL for redirect after login
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  next(); // User is authenticated, proceed to the next route
};

// Route to render the authentication page
app.get('/login', (req, res) => {
  // Always pass an error variable, even if it's undefined
  res.render('login', { error: undefined });
});

// Handle login submission
app.post('/login', (req, res) => {
  const { verificationCode, role } = req.body;
  const user = users.find(u => u.verificationCode === verificationCode && u.role === role);

  if (user) {
    req.session.user = user; // Store user data in the session
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo; // Clear the return URL after redirection
    res.redirect(redirectUrl);
  } else {
    // Pass error message to the login page
    res.render('login', { error: 'Invalid verification code or role' });
  }
});

// Routes that require authentication
app.get('/', checkAuth, (req, res) => {
  // Render the home page with dynamic features data
  res.render('index');
});

app.get('/post', checkAuth, (req, res) => {
  res.render('Post');
});

app.get('/aifeature', checkAuth, (req, res) => {
  res.render('aife');
});

app.get('/advance-ai', checkAuth, (req, res) => {
  res.render('feature');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
