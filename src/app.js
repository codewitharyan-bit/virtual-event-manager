require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const eventRoutes = require('./routes/event.route');
const userRoutes = require('./routes/user.route');  

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Event Management Platform API' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const ApiError = require('./utils/apiError');
  const ApiResponse = require('./utils/apiResponse');

  console.error(err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, err.data, err.message)
    );
  }

  res.status(500).json(
    new ApiResponse(500, null, 'Internal server error')
  );
});


module.exports = app;
