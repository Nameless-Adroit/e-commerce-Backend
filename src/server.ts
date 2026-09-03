import { createApp } from './app.js';
import { config } from './config/index.js';
import { testDatabaseConnection } from './database/db.js';
	async function bootstrap() {
  const app = createApp();

  await testDatabaseConnection();

  const server = app.listen(config.port, () => {
    console.log(`=====================================================`);
    console.log(`\n\t🛓 E-Commerce Backend is running in [${config.nodeEnv}] mode`);
    const baseUrl = `http://localhost:${config.port}/api`;
    console.log(`\r\n\t🌐 local Server URL: ${baseUrl}`);
    console.log(`\n\t\t🎟 Swagger Docs: http://localhost:${config.port}/api/docs`);
    console.log(`\n\t𗐃️ Database: ${config.database.client.toUpperCase()}`);
    console.log(`====================================================`);
  });


  const shutdown = () => {
    console.log('\nGracefully shutting down...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
