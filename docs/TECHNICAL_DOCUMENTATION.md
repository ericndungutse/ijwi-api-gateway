# API Gateway - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Implementation](#security-implementation)
3. [Proxy Configuration](#proxy-configuration)
4. [Error Handling Strategy](#error-handling-strategy)
5. [Performance Considerations](#performance-considerations)
6. [Deployment Guide](#deployment-guide)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### System Design

The API Gateway follows a reverse proxy pattern with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  API Gateway    │───▶│  Auth Service   │
│                 │    │   (Port 3000)   │    │  (Port 3001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Security Layer  │
                       │ (HMAC-SHA256)   │
                       └─────────────────┘
```

### Key Components

1. **Express.js Server**: Main application server handling HTTP requests
2. **Proxy Middleware**: Routes requests to downstream services
3. **Security Middleware**: Adds authentication headers to requests
4. **Error Handler**: Provides graceful error responses

### Request Flow

1. Client sends request to `/api/v1/auth/*`
2. Security middleware adds internal signature headers
3. Proxy middleware forwards request to auth service
4. Response is returned to client through the gateway

## 🔐 Security Implementation

### Internal Signature Verification

The API Gateway implements HMAC-SHA256 signature verification for inter-service communication:

```javascript
// Security middleware in app.js
app.use((req, res, next) => {
  if (!process.env.INTERNAL_SIGNATURE) {
    return res.status(500).json({ message: 'Internal server error' });
  }
  req.headers['X-Internal-Signature'] = hashString(process.env.INTERNAL_SIGNATURE);
  req.headers['X-Internal-Timestamp'] = Date.now().toString();
  next();
});
```

### Security Headers

| Header                 | Description                            | Format         |
| ---------------------- | -------------------------------------- | -------------- |
| `X-Internal-Signature` | HMAC-SHA256 hash of internal signature | Hex string     |
| `X-Internal-Timestamp` | Request timestamp for validation       | Unix timestamp |

### Hash Implementation

```javascript
// utils/hashString.js
import crypto from 'crypto';

const hashString = (string) => {
  return crypto.createHmac('sha256', string).digest('hex');
};
```

### Security Best Practices

1. **Environment Variables**: Store sensitive data in `.env` files
2. **Secret Rotation**: Regularly rotate `INTERNAL_SIGNATURE`
3. **HTTPS**: Use HTTPS in production environments
4. **Rate Limiting**: Implement rate limiting for production use

## 🔄 Proxy Configuration

### Authentication Service Proxy

```javascript
// routes/auth.proxy.js
const proxy = createProxyMiddleware({
  target: AUTH_SERVICE_DEV_URL,
  changeOrigin: true,
  logger: console,
  pathRewrite: {
    '^/': '/api/v1/auth/',
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log('🔥 onProxyReq fired', req.path);
    },
    proxyRes: (proxyRes, req, res) => {
      console.log('✅ onProxyRes fired');
    },
    error: (err, req, res) => {
      res.status(502).json({
        status: 'error',
        message: 'Auth service is currently unavailable',
        timestamp: new Date().toISOString(),
        service: 'auth',
      });
    },
  },
});
```

### Proxy Configuration Options

| Option         | Description              | Default                   |
| -------------- | ------------------------ | ------------------------- |
| `target`       | Target service URL       | Required                  |
| `changeOrigin` | Change request origin    | `true`                    |
| `pathRewrite`  | URL path rewriting rules | `{'^/': '/api/v1/auth/'}` |
| `logger`       | Logging function         | `console`                 |

### Adding New Service Proxies

To add a new service proxy:

1. Create a new proxy configuration file in `src/routes/`
2. Import the proxy in `src/app.js`
3. Add the route mapping

Example:

```javascript
// src/routes/user.proxy.js
import { createProxyMiddleware } from 'http-proxy-middleware';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const userProxy = createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/v1/users/',
  },
});

export default userProxy;
```

## 🚨 Error Handling Strategy

### Error Types

1. **Configuration Errors**: Missing environment variables
2. **Service Unavailable**: Downstream service not responding
3. **Network Errors**: Connection timeouts and failures

### Error Response Format

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "service-name",
  "code": "ERROR_CODE"
}
```

### Error Handling Implementation

```javascript
// Error handling in proxy configuration
error: (err, req, res) => {
  console.error('Proxy error:', err);
  res.status(502).json({
    status: 'error',
    message: 'Auth service is currently unavailable',
    timestamp: new Date().toISOString(),
    service: 'auth',
    code: 'SERVICE_UNAVAILABLE',
  });
};
```

### HTTP Status Codes

| Status Code | Description           | Use Case                |
| ----------- | --------------------- | ----------------------- |
| 200         | Success               | Normal response         |
| 400         | Bad Request           | Invalid request format  |
| 401         | Unauthorized          | Authentication required |
| 403         | Forbidden             | Access denied           |
| 500         | Internal Server Error | Configuration issues    |
| 502         | Bad Gateway           | Service unavailable     |

## ⚡ Performance Considerations

### Optimization Strategies

1. **Connection Pooling**: Reuse connections to downstream services
2. **Caching**: Implement response caching for static content
3. **Compression**: Enable gzip compression for responses
4. **Load Balancing**: Distribute requests across multiple service instances

### Memory Management

- Monitor memory usage in production
- Implement proper error handling to prevent memory leaks
- Use streaming for large file transfers

### Recommended Production Settings

```javascript
// Production optimizations
app.use(compression()); // Enable gzip compression
app.use(helmet()); // Security headers
app.use(rateLimit()); // Rate limiting
```

## 🚀 Deployment Guide

### Environment Setup

1. **Development Environment**

   ```bash
   npm run dev
   ```

2. **Production Environment**
   ```bash
   npm start
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
# Production Configuration
NODE_ENV=production
PORT=3000
INTERNAL_SIGNATURE=your-production-secret-key
AUTH_SERVICE_DEV_URL=https://auth-service.example.com

# Optional: Logging
LOG_LEVEL=info
```

### Load Balancer Configuration

For high availability, use a load balancer:

```nginx
# Nginx configuration example
upstream api_gateway {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring and Logging

### Logging Strategy

1. **Request Logging**: Log all incoming requests
2. **Error Logging**: Log all errors with stack traces
3. **Performance Logging**: Log response times and throughput

### Recommended Logging Implementation

```javascript
// Add to app.js
import morgan from 'morgan';

// Request logging
app.use(morgan('combined'));

// Error logging
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Health Check Endpoint

Add a health check endpoint:

```javascript
// Add to app.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### Metrics to Monitor

- Request rate (requests per second)
- Response time (average, 95th percentile)
- Error rate
- Memory usage
- CPU usage

## 🔧 Troubleshooting

### Common Issues

1. **Service Unavailable (502)**

   - Check if downstream service is running
   - Verify network connectivity
   - Check service URL configuration

2. **Internal Server Error (500)**

   - Verify environment variables are set
   - Check internal signature configuration
   - Review application logs

3. **Connection Timeouts**
   - Increase timeout settings
   - Check network latency
   - Verify service availability

### Debug Commands

```bash
# Check if service is running
curl http://localhost:3000/health

# Test proxy functionality
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Check environment variables
node -e "console.log(process.env)"
```

### Log Analysis

```bash
# View application logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Monitor real-time requests
tail -f logs/access.log
```

## 🔄 Version Control

### Git Workflow

1. **Feature Branches**: Create feature branches for new functionality
2. **Pull Requests**: Use pull requests for code review
3. **Semantic Versioning**: Follow semantic versioning for releases
4. **Changelog**: Maintain a changelog for releases

### Release Process

1. Update version in `package.json`
2. Update documentation
3. Create release notes
4. Tag the release
5. Deploy to production

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [http-proxy-middleware Documentation](https://github.com/chimurai/http-proxy-middleware)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Microservices Architecture Patterns](https://microservices.io/patterns/)
