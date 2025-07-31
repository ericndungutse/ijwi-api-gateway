import crypto from 'crypto';

// Hash a string using HMAC-SHA256
const hashString = (string) => {
  return crypto.createHmac('sha256', string).digest('hex');
};

export default hashString;
