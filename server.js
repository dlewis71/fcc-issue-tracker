'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const runner = require('./test-runner');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');

const app = express();

// Middleware
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); // For FCC testing only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end
app.route('/:project/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/issue.html');
});

// Index page (static HTML)
app.route('/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// FCC testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fcc-issuetracker';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start server
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);

      // Run tests only in test environment
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(() => {
          try {
            runner.run();
          } catch (err) {
            console.log('Tests are not valid:');
            console.error(err);
          }
        }, 3500);
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

module.exports = app; // For testing
