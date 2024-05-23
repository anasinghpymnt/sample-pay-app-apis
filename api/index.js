const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { OpenApiValidator } = require('express-openapi-validator');
const logger = require('./logger');
const config = require('./config');
const app = express();
try {

let schema;


// Load OpenAPI schema
try {
  schema = jsYaml.safeLoad(fs.readFileSync( config.OPENAPI_YAML));
} catch (e) {
  logger.error('failed to load OpenAPI schema', e.message);
}

// Setup middleware
app.use(cors());
app.use(bodyParser.json({ limit: '14MB' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Simple test route
app.get('/hello', (req, res) => res.send(`Hello World. path: ${config.OPENAPI_YAML}`));

// Serve OpenAPI document
app.get('/openapi', (req, res) => res.sendFile(path.join(__dirname, 'api', 'openapi.yaml')));

// Serve OpenAPI documentation UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(schema));

app.get('/login-redirect', (req, res) => {
  res.status(200).json(req.query);
});

app.get('/oauth2-redirect.html', (req, res) => {
  res.status(200).json(req.query);
});
console.log('registered');

// Initialize OpenApiValidator
const openapiValidator = new OpenApiValidator({
  apiSpec: config.OPENAPI_YAML,
  ignorePaths: /.*\/token$/i,
  validateRequests: false,
  validateResponses: false,
  operationHandlers: path.join(__dirname),
  fileUploader: { dest: config.FILE_UPLOAD_PATH },
});

openapiValidator.install(app);


app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || err,
    errors: err.errors || '',
  });
});

// Start the server

http.createServer(app).listen(config.URL_PORT);
console.log(`Listening on port ${config.URL_PORT}`);
} catch (e) {
  console.error('Error starting server:', e);
}

module.exports = app;