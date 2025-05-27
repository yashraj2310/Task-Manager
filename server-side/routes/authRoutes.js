import express from 'express';
import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Check if user already exists by username or email
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newUser = await User.create({
            username,
            email,
            passwordHash: password, // Pass the plain password; model will hash it
        });

        if (newUser) {
            const token = jwt.sign(
                { userId: newUser._id, username: newUser.username, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id, // Use _id from MongoDB
                    username: newUser.username,
                    email: newUser.email,
                },
            });
        } else {
            // This case should be rare if validation passes but creation fails for other reasons
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
             if (error.keyValue.username) {
                return res.status(400).json({ message: 'Username already exists.' });
            }
            if (error.keyValue.email) {
                return res.status(400).json({ message: 'Email already registered.' });
            }
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });

        if (user && (await user.comparePassword(password))) { // Use the model's method
            const token = jwt.sign(
                { userId: user._id, username: user.username, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

export default router;