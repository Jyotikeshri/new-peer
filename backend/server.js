// server.js (updated with Socket.io)
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import groupRoutes from './routes/groupRoutes.js';


import bodyParser from 'body-parser';
import { protect } from './middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config();
const app = express();

// Create HTTP server using Express app


// Set up Socket.io with CORS


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://new-peer.vercel.app' ,
  credentials: true
}));

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    
    return next();
  }
  
  
  bodyParser.json()(req, res, next);
});
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);




// Example protected route
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'You are authorized', user: req.user });
});

// Socket.io authentication middleware


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
