const app = require('./src/app');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
