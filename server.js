const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const connectDB = require('./db');
const exercisesRoutes = require('./routes/exercises');
const workoutLogsRoutes = require('./routes/workoutLogs');
const authRoutes = require('./routes/auth');

require('./config/passport')(passport);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({
    message: `Logged in as ${req.user.firstName} ${req.user.lastName}`,
    user: req.user
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRoutes);
app.use('/exercises', exercisesRoutes);
app.use('/workout-logs', workoutLogsRoutes);

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();