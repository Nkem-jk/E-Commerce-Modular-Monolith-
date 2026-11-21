require('dotenv').config();

const app = require('./app');
const prisma = require('./shared/config/db');
const redis = require('./shared/config/redis');
const { emailQueue } = require('./shared/queue/emailQueue');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Main app running on port ${PORT}`));

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close();

  await emailQueue.close();
  await redis.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl+C locally