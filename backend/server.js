// Require our shared environmental file as early as possible
require('dotenv').config();

// Importing from packages
const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');
const logger = require('@mirasaki/logger');
const bodyParser = require('body-parser');

// Importing local files
const pkg = require('../package.json');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const { addCORSHeader } = require('./middleware/cors');

// Importing our routes
const commandRoutes = require('./routes/commandRoutes.js');

// Destructure from our environmental file
const {
  NODE_ENV,
  PORT = 3000 // Set our default port to 3000 if it's missing from environmental file
} = process.env;

/*** JSDoc: Ignored
 * API Documentation
 */
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = { // https://swagger.io/specification/#openapi-object
  openapi: '3.0.0',
  info: {
    title: `RESTful Express API for ${ pkg.name }`,
    version: pkg.version,
    description: `This is a REST API application made with Express. It serves ${ pkg.name } command data.`,
    license: {
      name: 'MIT License',
      url: 'https://spdx.org/licenses/MIT.html'
    },
    contact: {
      name: 'Mirasaki',
      url: 'https://mirasaki.dev'
    }
  },
  servers: [
    {
      url: 'https://djs.mirasaki.dev/',
      description: 'Live Server'
    },
    {
      url: `http://localhost:${ PORT }`,
      description: 'Development Server'
    }
  ]
};
const options = {
  swaggerDefinition,
  failOnErrors: !!(NODE_ENV === 'production'), // Fail on parsing error in development mode
  apis: [ 'backend/docs/*.yaml' ] // Paths to files containing OpenAPI definitions
};
const openAPISpecification = swaggerJsDoc(options);

/***
 * Initialize our express app
 */
const app = express();

// Applying our Morgan logger middleware
app.use(
  // Use development mode in non-production environments
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev')
);

/*** Applying our body-parser middleware
 * As req.body's shape is based on user-controlled input,
 * all properties and values in this object are untrusted and
 * should be validated before trusting. For example, req.body.foo.toString()
 * may fail in multiple ways, for example the foo property may not be
 * there or may not be a string, and toString may not be a function and instead
 * a string or other user input.
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes Middleware
app.use('/api/commands', commandRoutes);

// Serving our generated client documentation as root
app.use(
  '/',
  express.static('docs', { extensions: [ 'html' ] })
);


// Serving our generated API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPISpecification));

// Serving our static public files
app.use(express.static('public'));


// Apply our local middleware
app.use(notFound);
app.use(errorHandler);
app.use(addCORSHeader);

// Actively listen for requests to our API/backend
app.listen(
  PORT,
  logger.success(chalk.yellow.bold(`API running in ${ NODE_ENV }-mode on port ${ PORT }`))
);


