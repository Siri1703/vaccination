import mongoose from 'mongoose';
import { IUser } from '../interface';

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  pincode: { type: String, required: true },
  aadharNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vaccinationStatus: {
    type: String,
    enum: ['none', 'firstDose', 'fullyVaccinated'],
    default: 'none'
  },
  registeredSlots: [{
    dose: { type: String, enum: ['firstDose', 'secondDose'] },
    date: Date,
    slotTime: String
  }]
});
export const User = mongoose.model<IUser>('User', userSchema);

