const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Workout Tracker API',
    description: 'API documentation for the Workout Tracker project. POST and DELETE routes for exercises require Google OAuth login.'
  },
  host: 'workout-tracker-tnwm.onrender.com',
  schemes: ['https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);