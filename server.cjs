const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all requests
app.use(limiter);

// Azure Web Apps provides the port via process.env.PORT
// We use 8080 as a backup for local testing
const PORT = process.env.PORT || 8080;

// 1. Serve the static files from the 'dist' directory (where Vite builds your app)
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Handle SPA Routing:
// This is the most important part. If a user goes to /dashboard, 
// the server doesn't have a dashboard folder, so we tell it 
// to send 'index.html' and let React Router handle the path.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 3. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
