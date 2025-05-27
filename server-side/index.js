import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; 

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Connect to Database
connectDB(); 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Task Manager API is running (ESM with MongoDB)!');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;