
import mongoose from 'mongoose';
import { IAdmin } from '../interface';

const adminSchema = new mongoose.Schema({
  _id: String,
  username: String,
  password: String,
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
});

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
