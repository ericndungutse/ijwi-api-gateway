import 'dotenv/config';
import express from 'express';
import authProxy from './routes/auth.proxy.js';
import hashString from './utils/hashString.js';

const PORT = process.env.PORT;

const app = express();

// Add hashed string to be verified by downstream services
app.use((req, res, next) => {
  
  if (!process.env.INTERNAL_SIGNATURE) {
    return res.status(500).json({ message: 'Internal server error' });
  }
  req.headers['X-Internal-Signature'] = hashString(process.env.INTERNAL_SIGNATURE);
  req.headers['X-Internal-Timestamp'] = Date.now().toString();
  next();
});

app.use('/api/v1/auth', authProxy);

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
