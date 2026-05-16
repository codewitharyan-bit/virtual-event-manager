# Event Management Platform API

A Node.js and Express-based REST API for managing events and user registrations.

## Features

- **User Authentication**: Register, login, and token-based authentication
- **Event Management**: Create, read, update, and delete events
- **Event Registration**: Users can register for events
- **Participant Management**: View event participants
- **Password Management**: Change password functionality
- **Email Notifications**: Send registration confirmation emails
- **JWT Authentication**: Secure API endpoints with JWT tokens

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Validation**: express-validator
- **Testing**: Jest and Supertest

## Project Structure

```
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── db.js             # MongoDB connection setup
│   ├── controllers/
│   │   ├── event.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.Middleware.js
│   │   └── validate.js
│   ├── models/
│   │   ├── event.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── event.route.js
│   │   └── user.route.js
│   ├── services/
│   │   ├── email.service.js
│   │   └── user.services.js
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   └── asyncHandler.js
│   └── validators/
│       └── eventValidator.js
├── server.js                 # Entry point
├── package.json
└── .env                      # Environment variables
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Event\ management\ platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://your-mongodb-uri
   JWT_SECRET=your-secret-key
   JWT_EXPIRY=7d
   REFRESH_TOKEN_SECRET=your-refresh-secret
   REFRESH_TOKEN_EXPIRY=30d
   SMTP_HOST=your-smtp-host
   SMTP_PORT=your-smtp-port
   SMTP_USER=your-email
   SMTP_PASS=your-email-password
   SMTP_FROM=noreply@yourdomain.com
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
Uses `nodemon` for automatic restart on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### User Routes (`/api/users`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user (requires authentication)
- `POST /refresh-token` - Refresh access token (requires authentication)
- `POST /change-password` - Change user password (requires authentication)

### Event Routes (`/api/events`)

- `GET /` - Get all events
- `GET /:id` - Get event by ID
- `POST /` - Create new event (requires authentication)
- `PUT /:id` - Update event (requires authentication)
- `DELETE /:id` - Delete event (requires authentication)
- `POST /:id/register` - Register for an event (requires authentication)
- `GET /:id/participants` - Get event participants (requires authentication)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Or alternatively, pass it as a cookie:
```
Cookie: accessToken=<your-jwt-token>
```

## Testing

Run tests with:
```bash
npm test
```

For detailed testing information, see [TESTING.md](TESTING.md)

### Test Features:
- ✅ 26+ test cases covering user and event endpoints
- ✅ Unit and integration tests
- ✅ Mock database operations
- ✅ JWT authentication testing
- ✅ Error handling validation

### Run tests with coverage:
```bash
npm test -- --coverage
```

## Error Handling

The API returns structured error responses:

```json
{
  "message": "Error description",
  "statusCode": 400,
  "success": false
}
```

## Response Format

All successful responses follow this format:

```json
{
  "statusCode": 200,
  "data": { },
  "message": "Success message",
  "success": true
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues or questions, please open an issue in the repository.
