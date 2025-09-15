module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-1234567890',
  UPLOAD_DIR: 'uploads/'
};
