import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.clientOrigins.includes('*') || config.clientOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const openApiDoc = {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce REST API',
      version: '1.0.0',
      description: 'Production-ready E-Commerce REST API supporting MySQL and PostgreSQL for React & Angular Frontends',
    },
    servers: [{ url: `http://localhost:${config.port}/api`, description: 'Local Development Server' }],
    paths: {
      '/health': { get: { summary: 'Health check', responses: { '200': { description: 'API is running' } } } },
      '/auth/register': { post: { summary: 'User registration', responses: { '201': { description: 'User registered' } } } },
      '/auth/login': { post: { summary: 'User login', responses: { '200': { description: 'User logged in' } } } },
      '/auth/profile': { get: { summary: 'Get current user profile', responses: { '200': { description: 'User profile' } } } },
      '/products': { get: { summary: 'List products with filters & pagination', responses: { '200': { description: 'List of products' } } } },
      '/products{identifier}': { get: { summary: 'Get product by slug or IE', responses: { '200': { description: 'Product details' } } } },
      '/cart': { get: { summary: 'Get shopping cart', responses: { '200': { description: 'Active shopping cart' } } } },
      '/cart/items': { post: { summary: 'Add product to cart', responses: { '200': { description: 'Updated cart' } } } },
      '/orders/checkout': { post: { summary: 'Place order and checkout', responses: { '201': { description: 'Order created' } } } },
      '/orders/my-orders': { get: { summary: 'List customer orders', responses: { '200': { description: 'List of orders' } } } },
    },
  };

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
  app.get('/api/docs.json', (req, res) => res.json(openApiDoc));


  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
