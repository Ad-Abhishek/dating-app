import express from 'express';
import sequelize from './db/sequelize.js';
import userRouter from './router/UserRouter.js';
import cors from 'cors';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));
app.use(express.json());

// Authenticate database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

// Test route
app.get('/api', (req, res) => {
  res.json({ 1: ['apple', 'ball', 'cat'] });
});

// Use userRouter for /users routes
app.use('/users', userRouter);

// Start server
app.listen(8080, () => {
  console.log('Server started on Port 8080');
});
