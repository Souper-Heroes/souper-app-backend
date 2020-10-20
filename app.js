import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import users from './routes/users.js';
import items from './routes/items.js';
import admin from 'firebase-admin';
import dotEnv from 'dotenv';
dotEnv.config();

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_DATABASE_URL
} = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: FIREBASE_PROJECT_ID,
    private_key: FIREBASE_PRIVATE_KEY,
    client_email: FIREBASE_CLIENT_EMAIL
  }),
  databaseURL: FIREBASE_DATABASE_URL
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
