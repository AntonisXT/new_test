const path = require('path');
const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Διαδρομή προς το OpenAPI spec (YAML)
const specPath = path.resolve(__dirname, '../../docs/openapi.yaml');

// Φόρτωση σε μνήμη (για /openapi.json και ως fallback)
let swaggerDocument;
try {
  swaggerDocument = YAML.load(specPath);
} catch (e) {
  console.error('Failed to load OpenAPI spec at', specPath, e.message);
  swaggerDocument = { openapi: '3.0.3', info: { title: 'API Docs', version: '0.0.0' }, paths: {} };
}

// Raw endpoints για tooling
router.get('/openapi.yaml', (_req, res) => res.sendFile(specPath));
router.get('/openapi.json', (_req, res) => res.json(swaggerDocument));

// Swagger UI — φορτώνει το spec από το endpoint ώστε να είναι πάντα “φρέσκο”
router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    explorer: true,
    swaggerUrl: 'openapi.json',
    customSiteTitle: 'El Greco API Docs',
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

module.exports = router;
