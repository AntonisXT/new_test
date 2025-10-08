const path = require('path');
const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load OpenAPI YAML from project root /docs/openapi.yaml
const specPath = path.resolve(__dirname, '../../docs/openapi.yaml');
let swaggerDocument;
try {
  swaggerDocument = YAML.load(specPath);
} catch (e) {
  console.error('Failed to load OpenAPI spec at', specPath, e.message);
  swaggerDocument = { openapi: '3.0.3', info: { title: 'API Docs', version: '0.0.0' }, paths: {} };
}

// Serve raw YAML/JSON for tooling
router.get('/openapi.yaml', (_req, res) => res.sendFile(specPath));
router.get('/openapi.json', (_req, res) => res.json(swaggerDocument));

// Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

module.exports = router;
