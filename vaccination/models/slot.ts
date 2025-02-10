import mongoose from 'mongoose';
import { ISlot } from '../interface';

const slotSchema = new mongoose.Schema<ISlot>({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  availableDoses: { type: Number, default: 10 },
  maxDoses: { type: Number, default: 10 },
  registeredUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dose: { type: String, enum: ['firstDose', 'secondDose'] }
  }]
});

export const Slot = mongoose.model<ISlot>('Slot', slotSchema);