// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import path from 'node:path';
import routes from './routes';
import uploadRoutes from './routes/uploadRoutes';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import createDebug from 'debug';
import yaml from 'js-yaml';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimit';

// ==========================================
// ⚙️ LAYER: Core (App Configuration)
// Purpose: Configure Express application, middleware, and routes
// ==========================================

const app: Express = express();
const logDocs = createDebug('fallhelp:api:docs');

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    process.env.ADMIN_URL || 'http://localhost:5173'
  ],
  credentials: true,
}));

// Custom JSON parser for Swagger UI (handles text/plain with JSON content)
app.use(express.text({ type: ['text/plain', 'application/json', '*/json'], limit: '10mb' }));
app.use((req, res, next) => {
  // If body is a string (from text parser), try to parse as JSON
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // If parse fails and content-type suggests JSON, return error
      if (req.is('json') || req.is('*/json')) {
        return res.status(400).json({ success: false, error: 'Invalid JSON' });
      }
    }
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// OpenAPI YAML (serve static spec generated from Postman) - DEV only
app.get('/openapi.yaml', (_req, res) => {
  const specPath = path.resolve(process.cwd(), 'docs', 'api', 'openapi.yaml');
  logDocs('Resolving OpenAPI spec at %s', specPath);
  if (!fs.existsSync(specPath)) {
    const parentDir = process.cwd();
    let files: string[] = [];
    try {
      files = fs.readdirSync(parentDir);
    } catch { }
    logDocs('Spec missing. Parent dir contents: %o', files);
    return res.status(404).json({ success: false, message: 'OpenAPI spec not found' });
  }
  res.type('text/yaml');
  res.send(fs.readFileSync(specPath, 'utf8'));
});

// Swagger UI - DEV only
if (process.env.NODE_ENV !== 'production') {
  const specPath = path.resolve(process.cwd(), 'docs', 'api', 'openapi.yaml');
  logDocs('Swagger UI looking for spec at %s', specPath);
  if (fs.existsSync(specPath)) {
    const raw = fs.readFileSync(specPath, 'utf8');
    let spec: any;
    try {
      spec = JSON.parse(raw);
      logDocs('Loaded OpenAPI as JSON');
    } catch {
      try {
        spec = yaml.load(raw);
        logDocs('Loaded OpenAPI as YAML');
      } catch (e) {
        logDocs('Failed to parse OpenAPI: %O', e);
      }
    }
    if (spec) {
      // Ensure Servers is set to a concrete URL (avoid {{baseurl}} placeholders)
      // Use /api prefix since all routes are mounted under /api
      const defaultUrl = process.env.OPENAPI_SERVER_URL || `http://localhost:${process.env.PORT || 3000}/api`;
      if (!spec.servers || !Array.isArray(spec.servers) || spec.servers.length === 0) {
        spec.servers = [{ url: defaultUrl }];
        logDocs('Injected default server URL %s into OpenAPI spec', defaultUrl);
      } else {
        const hasPlaceholder = spec.servers.some((s: any) => typeof s.url === 'string' && s.url.includes('{{'));
        if (hasPlaceholder) {
          spec.servers = [{ url: defaultUrl }];
          logDocs('Replaced placeholder server URL with %s', defaultUrl);
        }
      }

      // Configure Swagger UI options
      const swaggerOptions = {
        defaultModelsExpandDepth: -1,       // Hide schemas/models section at bottom
        defaultModelExpandDepth: -1,        // Don't expand model details
        docExpansion: 'list',               // Collapse all endpoints by default
        filter: true,                       // Enable search/filter
        showRequestHeaders: true,           // Show request headers
      };

      app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { swaggerOptions }));
    } else {
      app.get('/docs', (_req, res) => {
        res.status(503).send('<h3>Swagger UI unavailable</h3><p>OpenAPI file exists but could not be parsed.</p>');
      });
    }
  } else {
    // Fallback: show basic UI instructing user to generate spec
    app.get('/docs', (_req, res) => {
      res.status(503).send('<h3>Swagger UI unavailable</h3><p>Generate OpenAPI with <code>npm run openapi:gen</code> then refresh.</p>');
    });
  }
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
