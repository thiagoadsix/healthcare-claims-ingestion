import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';

import claimsRoutes from './application/routes/claims.routes';
import { fileUploadMiddleware, errorHandlerMiddleware } from './application/middleware';


const app = express();
const PORT = String(process.env.PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/claims', fileUploadMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Healthcare Claims Ingestion API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Healthcare Claims Ingestion API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      claims: '/claims'
    }
  });
});

// Routes
app.use('/', claimsRoutes);

app.use(errorHandlerMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare Claims Ingestion API is running on port ${PORT}`);
  console.log(`📋 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📄 Claims ingestion available at: http://localhost:${PORT}/claims`);
});

export default app;
