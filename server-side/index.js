import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; 

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import subTaskRoutes from './routes/subTaskRoutes.js'; 

// Connect to Database
connectDB(); 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Task Manager is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/subtasks', subTaskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;