import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import users from './routes/users.js';
import items from './routes/items.js';
import admin from 'firebase-admin';
import config from 'config';

admin.initializeApp({
  credential: admin.credential.cert(config.get('serviceAccount')),
  databaseURL: config.get('databaseURL')
});

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) =>
  res.json({ msg: 'Welcome to the souper heroes api' })
);

const PORT = process.env.PORT || 5000;

// Define Routes
app.use('/api/users', users);
app.use('/api/items', items);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
