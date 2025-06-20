import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import addCustomerKyc from './addCustomerKyc.mjs';
import updateCustomerKyc from './updateCustomerKyc.mjs';
import customerKycApproval from './customerKycApproval.mjs';
import customerKycDraft from './customerKycDraft.mjs';
import hodApprovalPending from './hodApprovalPending.mjs';
import viewCompletedKyc from './viewCompletedKyc.mjs';
import viewCustomerKycDetails from './viewCustomerKycDetails.mjs';
import viewCustomerKycDrafts from './viewCustomerKycDrafts.mjs';
import viewRevisionList from './viewRevisionList.mjs';
import viewAllCustomerKyc from './viewAllCustomerKyc.mjs';
import login from './login.mjs';
import s3FileDelete from './s3FileDelete.mjs';


// Load environment variables
dotenv.config();

// Get dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
// HTTP request logging disabled for cleaner console output
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/', login);
app.use('/', addCustomerKyc);
app.use('/', updateCustomerKyc);
app.use('/', customerKycApproval);
app.use('/', customerKycDraft);
app.use('/', hodApprovalPending);
app.use('/', viewCompletedKyc);
app.use('/', viewCustomerKycDetails);
app.use('/', s3FileDelete);
app.use('/', viewCustomerKycDrafts);
app.use('/', viewRevisionList);
app.use('/', viewAllCustomerKyc);


// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Customer KYC API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'production' 
      ? process.env.SERVER_MONGODB_URI 
      : process.env.MONGODB_URI;
      
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoUri.split('/').pop().split('?')[0]);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  process.exit(1);
});

export default app;
