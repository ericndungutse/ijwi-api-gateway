import { createProxyMiddleware } from 'http-proxy-middleware';

const AUTH_SERVICE_DEV_URL = process.env.AUTH_SERVICE_DEV_URL;

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
      // Send error response
      res.status(502).json({
        status: 'error',
        message: 'Auth service is currently unavailable',
        timestamp: new Date().toISOString(),
        service: 'auth',
      });
    },
  },
});

export default proxy;
