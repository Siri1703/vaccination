
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const routes = require('./routes')
const dotenv = require('dotenv')
import { SlotService } from "./services/slotService";
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
 

app.use('/api', routes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});