# API Gateway - Quick Start Guide

This guide will help you get the API Gateway up and running in under 5 minutes.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
# At minimum, you need:
PORT=3000
INTERNAL_SIGNATURE=your-secret-key-here
AUTH_SERVICE_DEV_URL=http://localhost:3001
```

### 3. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### 4. Test the Gateway

```bash
# Test health endpoint (if implemented)
curl http://localhost:3000/health

# Test auth proxy
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## ⚡ What Just Happened?

1. **Server Started**: The API Gateway is now running on port 3000
2. **Security Headers**: All requests automatically get internal signature headers
3. **Proxy Active**: Requests to `/api/v1/auth/*` are proxied to your auth service
4. **Error Handling**: If the auth service is down, you'll get a 502 error

## 🔧 Common Issues & Solutions

### Issue: "Internal server error"

**Solution**: Check that `INTERNAL_SIGNATURE` is set in your `.env` file

### Issue: "Auth service is currently unavailable"

**Solution**: Make sure your auth service is running on the URL specified in `AUTH_SERVICE_DEV_URL`

### Issue: "Port already in use"

**Solution**: Change the `PORT` in your `.env` file or stop the process using that port

## 📋 Next Steps

1. **Set up your auth service** on the URL specified in `AUTH_SERVICE_DEV_URL`
2. **Test the proxy** with your actual auth endpoints
3. **Configure production settings** when ready to deploy
4. **Add monitoring** for production use

## 🛠️ Development Tips

### Hot Reload

The development server automatically restarts when you make changes to the code.

### Environment Variables

All configuration is done through environment variables. See `env.example` for all available options.

### Logging

Check the console output for request logs and error messages.

### Adding New Services

To add a new service proxy:

1. Create a new proxy file in `src/routes/`
2. Import it in `src/app.js`
3. Add the route mapping

## 📚 More Information

- [README.md](../README.md) - Complete project documentation
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Detailed technical information
- [Environment Configuration](../env.example) - All available configuration options
