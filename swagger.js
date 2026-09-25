const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Workout Tracker API',
    description: 'API documentation for the Workout Tracker project'
  },
  host: 'localhost:8080',
  schemes: ['http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);