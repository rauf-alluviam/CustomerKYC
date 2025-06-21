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
 
  max:  10000, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

});

// Middleware
app.use(helmet());
// HTTP request logging disabled for cleaner console output
app.use(cors({
  origin: [
    'http://eximcustomerkyc.s3-website.ap-south-1.amazonaws.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://eximcustomerkyc.s3-website.ap-south-1.amazonaws.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false // Pass control to the next handler
}));
app.use(limiter); // Apply rate limiting after CORS
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
