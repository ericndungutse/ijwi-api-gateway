# API Gateway

A lightweight Node.js API gateway built with Express.js that provides authentication service proxying with internal signature verification.

## 🚀 Features

- **Service Proxying**: Routes authentication requests to downstream auth services
- **Internal Signature Verification**: Adds HMAC-SHA256 signatures for inter-service communication
- **Error Handling**: Graceful error responses when downstream services are unavailable
- **Environment-based Configuration**: Flexible configuration through environment variables
- **Development-friendly**: Hot reloading with nodemon for development

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd api-gateway
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables (see Configuration section below)

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000

# Internal Security
INTERNAL_SIGNATURE=your-secret-signature-key

# Downstream Services
AUTH_SERVICE_DEV_URL=http://localhost:3001
```

### Environment Variables

| Variable               | Description                                  | Required | Default |
| ---------------------- | -------------------------------------------- | -------- | ------- |
| `PORT`                 | Port number for the API gateway              | Yes      | -       |
| `INTERNAL_SIGNATURE`   | Secret key for internal service verification | Yes      | -       |
| `AUTH_SERVICE_DEV_URL` | URL of the authentication service            | Yes      | -       |

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The API gateway will start on the configured port (default: 3000).

## 📡 API Endpoints

### Authentication Service Proxy

All authentication-related requests are proxied to the downstream auth service:

- **Base Path**: `/api/v1/auth`
- **Proxy Target**: Configured via `AUTH_SERVICE_DEV_URL`

#### Example Requests

```bash
# Login request
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Register request
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

## 🔐 Security Features

### Internal Signature Verification

The API gateway automatically adds security headers to all proxied requests:

- `X-Internal-Signature`: HMAC-SHA256 hash of the internal signature
- `X-Internal-Timestamp`: Current timestamp for request validation

This ensures secure communication between services in your microservices architecture.

## 🏗️ Project Structure

```
api-gateway/
├── src/
│   ├── app.js              # Main application entry point
│   ├── routes/
│   │   └── auth.proxy.js   # Authentication service proxy configuration
│   └── utils/
│       └── hashString.js   # HMAC-SHA256 hashing utility
├── package.json
├── README.md
└── .env                    # Environment configuration (create this)
```

## 🧪 Development

### Running Tests

```bash
# Add test scripts to package.json when implementing tests
npm test
```

### Code Linting

```bash
# Add linting scripts when implementing ESLint
npm run lint
```

## 🚨 Error Handling

The API gateway provides graceful error handling:

- **502 Bad Gateway**: When the auth service is unavailable
- **500 Internal Server Error**: When internal signature is not configured

### Error Response Format

```json
{
  "status": "error",
  "message": "Auth service is currently unavailable",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "auth"
}
```

## 🔧 Customization

### Adding New Service Proxies

1. Create a new proxy configuration in `src/routes/`
2. Import and use the proxy in `src/app.js`
3. Configure the target URL in your environment variables

### Modifying Security Headers

Edit the middleware in `src/app.js` to add or modify security headers as needed.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For support and questions:

- Create an issue in the repository
- Contact the development team

## 🔄 Version History

- **v1.0.0**: Initial release with authentication service proxying
