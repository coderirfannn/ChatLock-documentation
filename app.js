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
  secret: 'yourStrongSecretHere', // Use a strong secret for your sessions
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 15 } // Session expiration time set to 15 minutes
}));

// Mock user data (now includes an 8-digit verification code and role)
const users = [
  { verificationCode: '93097696', role: 'UiUx' },
  { verificationCode: '23456789', role: 'Full Project' },
  { verificationCode: '34567890', role: 'Ui/Ux' },
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
  res.render('verify', { error: undefined });
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
    res.render('verify', { error: 'Invalid verification code or role' });
  }
});

// Routes that require authentication
app.get('/', checkAuth, (req, res) => {
  const { verificationCode, role } = req.session.user;
  res.render('index', { verificationCode, role });
});

app.post('/submit-progress', (req, res) => {
  const { task, description } = req.body;
  console.log('Progress submitted:', task, description);
  // Save to DB or process as needed
  res.redirect('/thank-you'); // Redirect or show success
});

app.get('/dashboard', checkAuth, (req, res) => {
  res.render('dashboard', {
    irfanTasks: [
      { task: 'Reactjs', description: 'Created login and signup pages' },
      { task: 'UI/UX', description: 'Designed mobile navigation' }
    ],
    wishuTasks: [
      { task: 'Reactjs', description: 'Integrated chat socket.io' }
    ],
    anjaliTasks: [],
    shrutiTasks: [
      { task: 'UI/UX', description: 'Worked on feed layout and responsive design' }
    ]
  });
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

// Logout route to destroy session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/login');
  });
});

// 404 Error handling (Optional)
app.use((req, res) => {
  res.status(404).render('404'); // Make sure you create a 404.ejs view
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
