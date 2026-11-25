require('dotenv').config();

const app = require('./app');
const prisma = require('./shared/config/db');

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Email service running on port ${PORT}`));

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));